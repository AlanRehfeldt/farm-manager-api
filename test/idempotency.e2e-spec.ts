import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import { randomUUID } from 'node:crypto';
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

function commandResult<T>(res: request.Response): T {
  return (res.body as ApiCommandResponse<T>).result;
}

function cookieHeader(res: request.Response): string {
  const setCookie = res.headers['set-cookie'];
  if (!setCookie) {
    throw new Error('Missing Set-Cookie header');
  }
  const cookies = Array.isArray(setCookie) ? setCookie : [setCookie];
  return cookies.map((cookie: string) => cookie.split(';')[0]).join('; ');
}

describe('Idempotency (e2e INV-IDEM)', () => {
  let app: INestApplication;
  let server: Server;
  let prisma: PrismaService;

  const suffix = `${Date.now()}`;
  const adminEmail = `idem.admin.${suffix}@example.com`;
  const adminPassword = 'Admin1!x';

  let adminCookies: string;
  let farmId: string;
  let productId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());
    await app.init();
    server = app.getHttpServer() as Server;
    prisma = app.get(PrismaService);

    await insertUser(prisma, {
      name: 'Idem Admin',
      email: adminEmail,
      password: adminPassword,
    });

    const loginAdmin = await request(server)
      .post('/auth/login')
      .send({ email: adminEmail, password: adminPassword })
      .expect(201);
    adminCookies = cookieHeader(loginAdmin);

    const orgRes = await request(server)
      .post('/organizations')
      .set('Cookie', adminCookies)
      .send({ name: `Idem Org ${suffix}` })
      .expect(201);
    const organizationId = commandResult<{ id: string }>(orgRes).id;

    const farmRes = await request(server)
      .post('/farms')
      .set('Cookie', adminCookies)
      .send({ organizationId, name: `Idem Farm ${suffix}` })
      .expect(201);
    farmId = commandResult<{ id: string }>(farmRes).id;

    const uomRes = await request(server)
      .post('/unit-of-measurements')
      .set('Cookie', adminCookies)
      .set('x-farm-id', farmId)
      .send({
        name: 'Kilogram',
        acronym: `kg${suffix.slice(-6)}`,
        dimension: 'MASS',
        isBase: true,
        factorToBase: '1',
      })
      .expect(201);
    const uomId = commandResult<{ id: string }>(uomRes).id;

    const categoriesRes = await request(server)
      .get('/cost-categories')
      .query({ perPage: 50, page: 1 })
      .set('Cookie', adminCookies)
      .set('x-farm-id', farmId)
      .expect(200);
    const fertilizanteCategoryId = (
      categoriesRes.body as { results: Array<{ id: string; code: string }> }
    ).results.find((category) => category.code === 'fertilizante')!.id;

    const productRes = await request(server)
      .post('/products')
      .set('Cookie', adminCookies)
      .set('x-farm-id', farmId)
      .send({
        name: `Ureia ${suffix}`,
        unitOfMeasurementId: uomId,
        costCategoryId: fertilizanteCategoryId,
      })
      .expect(201);
    productId = commandResult<{ id: string }>(productRes).id;
  }, 60000);

  afterAll(async () => {
    await app.close();
  });

  it('replays the same response for the same Idempotency-Key and body', async () => {
    const idempotencyKey = randomUUID();
    const body = {
      productId,
      quantity: '10',
      date: '2025-08-15',
      note: 'Ajuste inicial',
    };

    const first = await request(server)
      .post('/stock-adjustments')
      .set('Cookie', adminCookies)
      .set('x-farm-id', farmId)
      .set('Idempotency-Key', idempotencyKey)
      .send(body)
      .expect(201);

    const second = await request(server)
      .post('/stock-adjustments')
      .set('Cookie', adminCookies)
      .set('x-farm-id', farmId)
      .set('Idempotency-Key', idempotencyKey)
      .send(body)
      .expect(201);

    expect(second.body).toEqual(first.body);

    const movementCount = await prisma.stockMovement.count({
      where: { farmId, productId },
    });
    expect(movementCount).toBe(1);
  });

  it('returns IDEMPOTENCY_CONFLICT when the same key is reused with a different body', async () => {
    const idempotencyKey = randomUUID();
    const body = {
      productId,
      quantity: '5',
      date: '2025-08-16',
      note: 'Primeiro ajuste',
    };

    await request(server)
      .post('/stock-adjustments')
      .set('Cookie', adminCookies)
      .set('x-farm-id', farmId)
      .set('Idempotency-Key', idempotencyKey)
      .send(body)
      .expect(201);

    const conflict = await request(server)
      .post('/stock-adjustments')
      .set('Cookie', adminCookies)
      .set('x-farm-id', farmId)
      .set('Idempotency-Key', idempotencyKey)
      .send({
        ...body,
        quantity: '7',
        note: 'Body diferente',
      })
      .expect(409);

    expect(conflict.body).toMatchObject({
      statusCode: 409,
      message: 'IDEMPOTENCY_CONFLICT',
    });
  });
});
