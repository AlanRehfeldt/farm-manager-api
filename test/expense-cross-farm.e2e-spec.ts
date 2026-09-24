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

/**
 * PR-29 / PR-40: despesa paga na fazenda A com alocação na fazenda B.
 * Transaction.farmId = A; CostEntry.farmId = B; soma CostEntry = valor.
 */
describe('Expense cross-farm allocation (e2e)', () => {
  let app: INestApplication;
  let server: Server;
  let prisma: PrismaService;

  const suffix = `${Date.now()}`;
  const adminEmail = `xfarm.admin.${suffix}@example.com`;
  const adminPassword = 'Admin1!x';
  const expenseCents = 150_000;

  let adminCookies: string;
  let organizationId: string;
  let farmAId: string;
  let farmBId: string;
  let seasonBId: string;
  let fieldBId: string;
  let costCenterId: string;
  let accountPlanId: string;
  let energiaCategoryId: string;

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
      name: 'Cross Farm Admin',
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
        organizationName: `Cross Farm Org ${suffix}`,
        farmName: `Fazenda A ${suffix}`,
      })
      .expect(201);

    const onboarded = commandResult<{
      organization: { id: string };
      farm: { id: string };
    }>(onboardingRes);
    organizationId = onboarded.organization.id;
    farmAId = onboarded.farm.id;

    const farmBRes = await request(server)
      .post('/farms')
      .set('Cookie', adminCookies)
      .send({ organizationId, name: `Fazenda B ${suffix}` })
      .expect(201);
    farmBId = commandResult<{ id: string }>(farmBRes).id;

    const categoriesRes = await request(server)
      .get('/cost-categories')
      .set('Cookie', adminCookies)
      .set('x-farm-id', farmAId)
      .query({ perPage: 50 })
      .expect(200);
    const categories = listResults<{ id: string; code: string }>(categoriesRes);
    energiaCategoryId =
      categories.find((c) => c.code === 'energia_irrigacao')?.id ?? '';
    expect(energiaCategoryId).toBeTruthy();

    const uomRes = await request(server)
      .post('/unit-of-measurements')
      .set('Cookie', adminCookies)
      .set('x-farm-id', farmAId)
      .send({
        name: 'Quilograma',
        acronym: `kx${suffix}`.slice(0, 20),
        dimension: 'MASS',
        isBase: true,
        factorToBase: '1',
      })
      .expect(201);
    const kgUomId = commandResult<{ id: string }>(uomRes).id;

    const cropRes = await request(server)
      .post('/crops')
      .set('Cookie', adminCookies)
      .set('x-farm-id', farmAId)
      .send({ name: 'Manga Cross', defaultProductionUomId: kgUomId })
      .expect(201);
    const cropId = commandResult<{ id: string }>(cropRes).id;

    const fieldRes = await request(server)
      .post('/fields')
      .set('Cookie', adminCookies)
      .set('x-farm-id', farmBId)
      .send({ name: 'Talhao B1', areaHa: 40 })
      .expect(201);
    fieldBId = commandResult<{ id: string }>(fieldRes).id;

    const seasonRes = await request(server)
      .post('/crop-seasons')
      .set('Cookie', adminCookies)
      .set('x-farm-id', farmBId)
      .send({
        name: 'Safra B 25/26',
        cropId,
        startDate: '2025-08-01',
        productionUomId: kgUomId,
      })
      .expect(201);
    seasonBId = commandResult<{ id: string }>(seasonRes).id;

    await request(server)
      .post('/crop-plantings')
      .set('Cookie', adminCookies)
      .set('x-farm-id', farmBId)
      .send({ cropSeasonId: seasonBId, fieldId: fieldBId })
      .expect(201);

    await request(server)
      .patch(`/crop-seasons/${seasonBId}/activate`)
      .set('Cookie', adminCookies)
      .set('x-farm-id', farmBId)
      .expect(200);

    const ccRes = await request(server)
      .post('/cost-centers')
      .set('Cookie', adminCookies)
      .set('x-farm-id', farmAId)
      .send({
        name: 'Centro Cross',
        description: 'CC cross-farm',
        code: `CC-XF-${suffix}`,
      })
      .expect(201);
    costCenterId = commandResult<{ id: string }>(ccRes).id;

    const apRes = await request(server)
      .post('/account-plans')
      .set('Cookie', adminCookies)
      .set('x-farm-id', farmAId)
      .send({
        name: 'Plano Cross',
        description: 'AP cross-farm',
        code: `AP-XF-${suffix}`,
      })
      .expect(201);
    accountPlanId = commandResult<{ id: string }>(apRes).id;
  });

  afterAll(async () => {
    await app.close();
  });

  it('creates CostEntry on destination farm B while Transaction stays on payer A', async () => {
    const expenseRes = await request(server)
      .post('/expenses')
      .set('Cookie', adminCookies)
      .set('x-farm-id', farmAId)
      .send({
        type: 'GENERIC',
        date: '2025-09-10',
        generic: { subtype: 'GENERAL_EXPENSE' },
        installments: [
          {
            valueInCents: expenseCents,
            dueDate: '2025-09-20',
            paymentForm: 'TRANSFER',
          },
        ],
        allocations: [
          {
            farmId: farmBId,
            costCenterId,
            accountPlanId,
            costCategoryId: energiaCategoryId,
            cropSeasonId: seasonBId,
            fieldId: fieldBId,
            allocatedValueInCents: expenseCents,
          },
        ],
      })
      .expect(201);

    const expense = commandResult<{
      id: string;
      farmId: string;
      allocations: { id: string; farmId: string }[];
    }>(expenseRes);
    expect(expense.id).toBeTruthy();
    expect(expense.farmId).toBe(farmAId);
    expect(expense.allocations[0]?.farmId).toBe(farmBId);

    const transaction = await prisma.transaction.findUniqueOrThrow({
      where: { id: expense.id },
    });
    expect(transaction.farmId).toBe(farmAId);

    const allocationIds = (
      await prisma.transactionAllocation.findMany({
        where: { transactionId: expense.id },
        select: { id: true, farmId: true },
      })
    ).map((a) => a.id);

    expect(allocationIds.length).toBeGreaterThan(0);

    const costEntries = await prisma.costEntry.findMany({
      where: {
        sourceId: { in: allocationIds },
        sourceType: 'ALLOCATION',
        reversedAt: null,
      },
    });

    expect(costEntries.length).toBeGreaterThan(0);
    for (const entry of costEntries) {
      expect(entry.farmId).toBe(farmBId);
      expect(entry.cropSeasonId).toBe(seasonBId);
    }

    const sum = costEntries.reduce(
      (acc, entry) => acc + entry.amountInCents,
      0n,
    );
    expect(sum).toBe(BigInt(expenseCents));

    const payerSideEntries = await prisma.costEntry.count({
      where: {
        farmId: farmAId,
        sourceId: { in: allocationIds },
        sourceType: 'ALLOCATION',
        reversedAt: null,
      },
    });
    expect(payerSideEntries).toBe(0);
  });
});
