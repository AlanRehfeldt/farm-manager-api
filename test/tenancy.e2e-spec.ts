import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import { Server } from 'node:http';
import request from 'supertest';
import { Prisma } from '@prisma/client';
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

describe('Tenancy (e2e)', () => {
  let app: INestApplication;
  let server: Server;
  let prisma: PrismaService;

  const suffix = `${Date.now()}`;
  const adminEmail = `admin.${suffix}@example.com`;
  const adminPassword = 'Admin1!x';
  const norteEmail = `norte.${suffix}@example.com`;
  const nortePassword = 'Norte1!x';
  const outsiderEmail = `out.${suffix}@example.com`;
  const outsiderPassword = 'Outsid1!';

  let adminCookies: string;
  let norteCookies: string;
  let outsiderCookies: string;
  let organizationId: string;
  let sedeId: string;
  let norteId: string;
  let otherFarmId: string;
  let ureiaId: string;
  let sedeOnlyProductId: string;
  let sedeTxId: string;
  let joaoId: string;
  let mariaId: string;

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
      name: 'Admin Rehfeldt',
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
      .send({ name: `Rehfeldt ${suffix}` })
      .expect(201);
    organizationId = commandResult<{ id: string }>(orgRes).id;

    const sedeRes = await request(server)
      .post('/farms')
      .set('Cookie', adminCookies)
      .send({ organizationId, name: `Sede ${suffix}` })
      .expect(201);
    sedeId = commandResult<{ id: string }>(sedeRes).id;

    const norteRes = await request(server)
      .post('/farms')
      .set('Cookie', adminCookies)
      .send({ organizationId, name: `Norte ${suffix}` })
      .expect(201);
    norteId = commandResult<{ id: string }>(norteRes).id;

    await request(server)
      .post('/memberships')
      .set('Cookie', adminCookies)
      .send({
        organizationId,
        farmId: norteId,
        role: 'USER',
        name: 'Norte Operator',
        email: norteEmail,
        password: nortePassword,
      })
      .expect(201);

    const loginNorte = await request(server)
      .post('/auth/login')
      .send({ email: norteEmail, password: nortePassword })
      .expect(201);
    norteCookies = cookieHeader(loginNorte);

    await insertUser(prisma, {
      name: 'Outra Org User',
      email: outsiderEmail,
      password: outsiderPassword,
    });

    const loginOutsider = await request(server)
      .post('/auth/login')
      .send({ email: outsiderEmail, password: outsiderPassword })
      .expect(201);
    outsiderCookies = cookieHeader(loginOutsider);

    const otherOrg = await request(server)
      .post('/organizations')
      .set('Cookie', outsiderCookies)
      .send({ name: `Outra Org ${suffix}` })
      .expect(201);

    const otherFarm = await request(server)
      .post('/farms')
      .set('Cookie', outsiderCookies)
      .send({
        organizationId: commandResult<{ id: string }>(otherOrg).id,
        name: `Fazenda B ${suffix}`,
      })
      .expect(201);
    otherFarmId = commandResult<{ id: string }>(otherFarm).id;
  }, 60000);

  afterAll(async () => {
    await app.close();
  });

  it('GET /auth/me includes org-wide membership', async () => {
    const res = await request(server)
      .get('/auth/me')
      .set('Cookie', adminCookies)
      .expect(200);

    const memberships = commandResult<{
      memberships: Array<{
        organizationId: string;
        farmId: string | null;
        role: string;
      }>;
    }>(res).memberships;

    expect(memberships).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          organizationId,
          farmId: null,
          role: 'ADMIN',
        }),
      ]),
    );
  });

  it('lists farms without x-farm-id', async () => {
    const res = await request(server)
      .get('/farms')
      .set('Cookie', adminCookies)
      .expect(200);

    const ids = listResults<{ id: string }>(res).map((farm) => farm.id);
    expect(ids).toEqual(expect.arrayContaining([sedeId, norteId]));
  });

  it('returns 400 when x-farm-id is missing on a farm-scoped route', async () => {
    await request(server)
      .get('/products')
      .set('Cookie', adminCookies)
      .expect(400);
  });

  it('returns 403 FORBIDDEN_FARM when farm belongs to another org', async () => {
    await request(server)
      .get('/products')
      .set('Cookie', adminCookies)
      .set('x-farm-id', otherFarmId)
      .expect(403);
  });

  it('returns 403 when a Norte-only member uses the Sede header', async () => {
    await request(server)
      .get('/products')
      .set('Cookie', norteCookies)
      .set('x-farm-id', sedeId)
      .expect(403);
  });

  it('shares org-wide catalog and hides farm-restricted rows (INV-TEN catalog)', async () => {
    const uom = await request(server)
      .post('/unit-of-measurements')
      .set('Cookie', adminCookies)
      .set('x-farm-id', sedeId)
      .send({
        name: 'Kilogram',
        acronym: `kg${suffix.slice(-8)}`,
        dimension: 'MASS',
        isBase: true,
        factorToBase: '1',
      })
      .expect(201);
    const uomId = commandResult<{ id: string }>(uom).id;

    const categoriesRes = await request(server)
      .get('/cost-categories')
      .query({ perPage: 50, page: 1 })
      .set('Cookie', adminCookies)
      .set('x-farm-id', sedeId)
      .expect(200);
    const fertilizanteCategoryId = listResults<{ id: string; code: string }>(
      categoriesRes,
    ).find((category) => category.code === 'fertilizante')!.id;

    const ureiaName = `Ureia ${suffix}`;
    const ureia = await request(server)
      .post('/products')
      .set('Cookie', adminCookies)
      .set('x-farm-id', sedeId)
      .send({
        name: ureiaName,
        unitOfMeasurementId: uomId,
        costCategoryId: fertilizanteCategoryId,
      })
      .expect(201);
    const ureiaResult = commandResult<{ id: string; farmId: string | null }>(
      ureia,
    );
    ureiaId = ureiaResult.id;
    expect(ureiaResult.farmId).toBeNull();

    const sedeOnlyName = `Sede ${suffix} NP`;
    const sedeOnly = await request(server)
      .post('/products')
      .set('Cookie', adminCookies)
      .set('x-farm-id', sedeId)
      .send({
        name: sedeOnlyName,
        unitOfMeasurementId: uomId,
        farmId: sedeId,
        costCategoryId: fertilizanteCategoryId,
      })
      .expect(201);
    const sedeOnlyResult = commandResult<{ id: string; farmId: string | null }>(
      sedeOnly,
    );
    sedeOnlyProductId = sedeOnlyResult.id;
    expect(sedeOnlyResult.farmId).toBe(sedeId);

    const sedeList = await request(server)
      .get('/products')
      .query({ perPage: 50 })
      .set('Cookie', adminCookies)
      .set('x-farm-id', sedeId)
      .expect(200);
    const sedeIds = listResults<{ id: string }>(sedeList).map(
      (product) => product.id,
    );
    expect(sedeIds).toEqual(
      expect.arrayContaining([ureiaId, sedeOnlyProductId]),
    );

    const norteList = await request(server)
      .get('/products')
      .query({ perPage: 50 })
      .set('Cookie', norteCookies)
      .set('x-farm-id', norteId)
      .expect(200);
    const norteIds = listResults<{ id: string }>(norteList).map(
      (product) => product.id,
    );
    expect(norteIds).toContain(ureiaId);
    expect(norteIds).not.toContain(sedeOnlyProductId);

    await request(server)
      .get(`/products/${sedeOnlyProductId}`)
      .set('Cookie', norteCookies)
      .set('x-farm-id', norteId)
      .expect(404);

    await request(server)
      .get(`/products/${ureiaId}`)
      .set('Cookie', norteCookies)
      .set('x-farm-id', norteId)
      .expect(200);
  });

  it('lists org-wide employees on both farms and restricts farm-scoped ones', async () => {
    const joao = await request(server)
      .post('/employees')
      .set('Cookie', adminCookies)
      .set('x-farm-id', sedeId)
      .send({
        name: 'Joao Colaborador',
        registration: `J${suffix}`.slice(0, 20),
        type: 'FIELD_WORKER',
      })
      .expect(201);
    const joaoResult = commandResult<{ id: string; farmId: string | null }>(
      joao,
    );
    joaoId = joaoResult.id;
    expect(joaoResult.farmId).toBeNull();

    const maria = await request(server)
      .post('/employees')
      .set('Cookie', adminCookies)
      .set('x-farm-id', sedeId)
      .send({
        name: 'Maria da Sede',
        registration: `M${suffix}`.slice(0, 20),
        type: 'ADMINISTRATIVE_ASSISTANT',
        farmId: sedeId,
      })
      .expect(201);
    const mariaResult = commandResult<{ id: string; farmId: string | null }>(
      maria,
    );
    mariaId = mariaResult.id;
    expect(mariaResult.farmId).toBe(sedeId);

    const norteList = await request(server)
      .get('/employees')
      .query({ perPage: 50 })
      .set('Cookie', norteCookies)
      .set('x-farm-id', norteId)
      .expect(200);
    const norteIds = listResults<{ id: string }>(norteList).map(
      (employee) => employee.id,
    );
    expect(norteIds).toContain(joaoId);
    expect(norteIds).not.toContain(mariaId);

    await request(server)
      .get(`/employees/${mariaId}`)
      .set('Cookie', norteCookies)
      .set('x-farm-id', norteId)
      .expect(404);
  });

  it('isolates transactions by farm (INV-TEN)', async () => {
    const created = await request(server)
      .post('/transactions')
      .set('Cookie', adminCookies)
      .set('x-farm-id', sedeId)
      .send({
        type: 'GENERIC',
        date: '2026-08-01T00:00:00.000Z',
        note: `Sede tx ${suffix}`,
      })
      .expect(201);
    const txResult = commandResult<{ id: string; farmId: string }>(created);
    sedeTxId = txResult.id;
    expect(txResult.farmId).toBe(sedeId);

    const norteList = await request(server)
      .get('/transactions')
      .query({ perPage: 50, orderBy: 'date' })
      .set('Cookie', norteCookies)
      .set('x-farm-id', norteId)
      .expect(200);
    const norteIds = listResults<{ id: string }>(norteList).map((tx) => tx.id);
    expect(norteIds).not.toContain(sedeTxId);

    await request(server)
      .get(`/transactions/${sedeTxId}`)
      .set('Cookie', norteCookies)
      .set('x-farm-id', norteId)
      .expect(404);

    await request(server)
      .get(`/transactions/${sedeTxId}`)
      .set('Cookie', adminCookies)
      .set('x-farm-id', sedeId)
      .expect(200);
  });

  it('keeps one shared product with a stock balance per farm', async () => {
    await prisma.productStockBalance.create({
      data: {
        farmId: sedeId,
        productId: ureiaId,
        quantityOnHand: new Prisma.Decimal(10),
      },
    });
    await prisma.productStockBalance.create({
      data: {
        farmId: norteId,
        productId: ureiaId,
        quantityOnHand: new Prisma.Decimal(4),
      },
    });

    await expect(
      prisma.productStockBalance.create({
        data: {
          farmId: sedeId,
          productId: ureiaId,
          quantityOnHand: new Prisma.Decimal(1),
        },
      }),
    ).rejects.toMatchObject({ code: 'P2002' });

    const balances = await prisma.productStockBalance.findMany({
      where: { productId: ureiaId },
    });
    expect(balances).toHaveLength(2);
  });
});
