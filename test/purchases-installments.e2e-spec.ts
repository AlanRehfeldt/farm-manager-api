import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import { Server } from 'node:http';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/common/prisma/prisma.service';
import { insertUser } from './helpers/insert-user';

type ApiCommandResponse<T> = {
  statusCode: number;
  message: string;
  result: T;
};

type ApiListResponse<T> = {
  results: T[];
  total: number;
};

function commandResult<T>(res: request.Response): T {
  return (res.body as ApiCommandResponse<T>).result;
}

function listResults<T>(res: request.Response): T[] {
  return (res.body as ApiListResponse<T>).results;
}

function cookieHeader(res: request.Response): string {
  const setCookie = res.headers['set-cookie'];
  if (!setCookie) {
    throw new Error('Missing Set-Cookie header');
  }
  const cookies = Array.isArray(setCookie) ? setCookie : [setCookie];
  return cookies.map((cookie: string) => cookie.split(';')[0]).join('; ');
}

type PurchaseInstallment = {
  valueInCents: number;
  dueDate: string;
  paymentForm: string;
  manuallyAdjusted: boolean;
};

/**
 * PR-28 / PR-35 / PR-40: compra com parcelas (manuallyAdjusted) e rejeição de valor zero.
 */
describe('Purchase installments (e2e)', () => {
  let app: INestApplication;
  let server: Server;

  const suffix = `${Date.now()}`;
  const adminEmail = `inst.admin.${suffix}@example.com`;
  const adminPassword = 'Admin1!x';

  let adminCookies: string;
  let farmId: string;
  let productId: string;
  let supplierId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());
    await app.init();
    server = app.getHttpServer() as Server;

    await insertUser(app.get(PrismaService), {
      name: 'Installments Admin',
      email: adminEmail,
      password: adminPassword,
    });

    const loginRes = await request(server)
      .post('/auth/login')
      .send({ email: adminEmail, password: adminPassword })
      .expect(201);
    adminCookies = cookieHeader(loginRes);

    const onboardingRes = await request(server)
      .post('/onboarding')
      .set('Cookie', adminCookies)
      .send({
        organizationName: `Installments Org ${suffix}`,
        farmName: `Sede Inst ${suffix}`,
      })
      .expect(201);
    farmId = commandResult<{ farm: { id: string } }>(onboardingRes).farm.id;

    const categoriesRes = await request(server)
      .get('/cost-categories')
      .set('Cookie', adminCookies)
      .set('x-farm-id', farmId)
      .query({ perPage: 50 })
      .expect(200);
    const fertilizanteCategoryId =
      listResults<{ id: string; code: string }>(categoriesRes).find(
        (c) => c.code === 'fertilizante',
      )?.id ?? '';
    expect(fertilizanteCategoryId).toBeTruthy();

    const uomRes = await request(server)
      .post('/unit-of-measurements')
      .set('Cookie', adminCookies)
      .set('x-farm-id', farmId)
      .send({
        name: 'Quilograma',
        acronym: `ki${suffix}`.slice(0, 20),
        dimension: 'MASS',
        isBase: true,
        factorToBase: '1',
      })
      .expect(201);
    const kgUomId = commandResult<{ id: string }>(uomRes).id;

    const productRes = await request(server)
      .post('/products')
      .set('Cookie', adminCookies)
      .set('x-farm-id', farmId)
      .send({
        name: 'Fertilizante Parcelas',
        unitOfMeasurementId: kgUomId,
        costCategoryId: fertilizanteCategoryId,
      })
      .expect(201);
    productId = commandResult<{ id: string }>(productRes).id;

    const supplierRes = await request(server)
      .post('/suppliers')
      .set('Cookie', adminCookies)
      .set('x-farm-id', farmId)
      .send({
        name: 'Fornecedor Parcelas',
        cnpj: '11222333000181',
      })
      .expect(201);
    supplierId = commandResult<{ id: string }>(supplierRes).id;
  });

  afterAll(async () => {
    await app.close();
  });

  it('persists multiple installments including manuallyAdjusted', async () => {
    const totalCents = 10_000;
    const purchaseRes = await request(server)
      .post('/purchases')
      .set('Cookie', adminCookies)
      .set('x-farm-id', farmId)
      .send({
        date: '2025-09-01',
        supplierId,
        items: [
          {
            productId,
            quantity: '2',
            priceInCents: 5000,
          },
        ],
        installments: [
          {
            valueInCents: 6000,
            dueDate: '2025-09-15',
            paymentForm: 'PIX',
            manuallyAdjusted: true,
          },
          {
            valueInCents: 4000,
            dueDate: '2025-10-15',
            paymentForm: 'BANK_SLIP',
            manuallyAdjusted: false,
          },
        ],
      })
      .expect(201);

    const purchase = commandResult<{
      id: string;
      installments: PurchaseInstallment[];
    }>(purchaseRes);

    expect(purchase.installments).toHaveLength(2);
    expect(purchase.installments[0].valueInCents).toBe(6000);
    expect(purchase.installments[0].manuallyAdjusted).toBe(true);
    expect(purchase.installments[1].valueInCents).toBe(4000);
    expect(purchase.installments[1].manuallyAdjusted).toBe(false);

    const sum = purchase.installments.reduce(
      (acc, inst) => acc + inst.valueInCents,
      0,
    );
    expect(sum).toBe(totalCents);
  });

  it('rejects installment with valueInCents zero', async () => {
    await request(server)
      .post('/purchases')
      .set('Cookie', adminCookies)
      .set('x-farm-id', farmId)
      .send({
        date: '2025-09-02',
        supplierId,
        items: [
          {
            productId,
            quantity: '1',
            priceInCents: 100,
          },
        ],
        installments: [
          {
            valueInCents: 100,
            dueDate: '2025-09-15',
            paymentForm: 'PIX',
          },
          {
            valueInCents: 0,
            dueDate: '2025-10-15',
            paymentForm: 'PIX',
          },
        ],
      })
      .expect(400);
  });
});
