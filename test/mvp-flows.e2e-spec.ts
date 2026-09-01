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
 * Fluxos F3–F7 (key-flows): compra → atividade → despesa → colheita → custeio → fechar safra.
 * Cobre INV-DC01 (compra sem CostEntry), INV-DC04 (colheita sem CostEntry), INV-CLOSE.
 */
describe('MVP flows F3–F7 (e2e)', () => {
  let app: INestApplication;
  let server: Server;

  const suffix = `${Date.now()}`;
  const adminEmail = `mvp.admin.${suffix}@example.com`;
  const adminPassword = 'Admin1!x';

  let adminCookies: string;
  let farmId: string;
  let kgUomId: string;
  let cropId: string;
  let fieldId: string;
  let seasonId: string;
  let productId: string;
  let supplierId: string;
  let costCenterId: string;
  let accountPlanId: string;
  let fertilizanteCategoryId: string;
  let energiaCategoryId: string;

  const purchaseQty = '100';
  const purchaseUnitCents = 5000;
  const purchaseTotalCents = 100 * purchaseUnitCents;
  const activityQty = '50';
  const activityCostCents = 50 * purchaseUnitCents;
  const expenseCents = 100000;
  const harvestQty = '1000';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());
    await app.init();
    server = app.getHttpServer() as Server;

    await insertUser(app.get(PrismaService), {
      name: 'MVP Admin',
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
        organizationName: `MVP Org ${suffix}`,
        farmName: `Sede ${suffix}`,
      })
      .expect(201);

    farmId = commandResult<{ farm: { id: string } }>(onboardingRes).farm.id;

    const categoriesRes = await request(server)
      .get('/cost-categories')
      .set('Cookie', adminCookies)
      .set('x-farm-id', farmId)
      .query({ perPage: 50 })
      .expect(200);

    const categories = listResults<{ id: string; code: string }>(categoriesRes);
    fertilizanteCategoryId =
      categories.find((c) => c.code === 'fertilizante')?.id ?? '';
    energiaCategoryId =
      categories.find((c) => c.code === 'energia_irrigacao')?.id ?? '';
    expect(fertilizanteCategoryId).toBeTruthy();
    expect(energiaCategoryId).toBeTruthy();

    const uomRes = await request(server)
      .post('/unit-of-measurements')
      .set('Cookie', adminCookies)
      .set('x-farm-id', farmId)
      .send({
        name: 'Quilograma',
        acronym: `kg-${suffix}`,
        dimension: 'MASS',
        isBase: true,
        factorToBase: '1',
      })
      .expect(201);
    kgUomId = commandResult<{ id: string }>(uomRes).id;

    const cropRes = await request(server)
      .post('/crops')
      .set('Cookie', adminCookies)
      .set('x-farm-id', farmId)
      .send({ name: 'Manga', defaultProductionUomId: kgUomId })
      .expect(201);
    cropId = commandResult<{ id: string }>(cropRes).id;

    const fieldRes = await request(server)
      .post('/fields')
      .set('Cookie', adminCookies)
      .set('x-farm-id', farmId)
      .send({ name: 'T1', areaHa: 85.5 })
      .expect(201);
    fieldId = commandResult<{ id: string }>(fieldRes).id;

    const seasonRes = await request(server)
      .post('/crop-seasons')
      .set('Cookie', adminCookies)
      .set('x-farm-id', farmId)
      .send({
        name: 'Manga 25/26',
        cropId,
        startDate: '2025-08-01',
        productionUomId: kgUomId,
      })
      .expect(201);
    seasonId = commandResult<{ id: string }>(seasonRes).id;

    await request(server)
      .post('/crop-plantings')
      .set('Cookie', adminCookies)
      .set('x-farm-id', farmId)
      .send({ cropSeasonId: seasonId, fieldId })
      .expect(201);

    await request(server)
      .patch(`/crop-seasons/${seasonId}/activate`)
      .set('Cookie', adminCookies)
      .set('x-farm-id', farmId)
      .expect(200);

    const productRes = await request(server)
      .post('/products')
      .set('Cookie', adminCookies)
      .set('x-farm-id', farmId)
      .send({
        name: 'Fertilizante NPK',
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
        name: 'Agro Insumos',
        cnpj: '11222333000181',
      })
      .expect(201);
    supplierId = commandResult<{ id: string }>(supplierRes).id;

    const ccRes = await request(server)
      .post('/cost-centers')
      .set('Cookie', adminCookies)
      .set('x-farm-id', farmId)
      .send({
        name: 'Produção Manga',
        description: 'Centro de custo produção',
        code: `CC-${suffix}`,
      })
      .expect(201);
    costCenterId = commandResult<{ id: string }>(ccRes).id;

    const apRes = await request(server)
      .post('/account-plans')
      .set('Cookie', adminCookies)
      .set('x-farm-id', farmId)
      .send({
        name: 'Despesas operacionais',
        description: 'Plano despesas',
        code: `AP-${suffix}`,
      })
      .expect(201);
    accountPlanId = commandResult<{ id: string }>(apRes).id;
  });

  afterAll(async () => {
    await app.close();
  });

  it('F3: purchase creates stock IN and updates average cost', async () => {
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
            quantity: purchaseQty,
            priceInCents: purchaseUnitCents,
          },
        ],
        installments: [
          {
            valueInCents: purchaseTotalCents,
            dueDate: '2025-09-15',
            paymentForm: 'PIX',
          },
        ],
      })
      .expect(201);

    expect(commandResult<{ id: string }>(purchaseRes).id).toBeTruthy();

    const balancesRes = await request(server)
      .get('/stock-balances')
      .set('Cookie', adminCookies)
      .set('x-farm-id', farmId)
      .query({ name: 'Fertilizante', perPage: 10 })
      .expect(200);

    const balance = listResults<{
      productId: string;
      quantityOnHand: string;
      avgCost: string;
    }>(balancesRes).find((b) => b.productId === productId);

    expect(balance?.quantityOnHand).toBe(purchaseQty);
    expect(balance?.avgCost).toBe('50');
  });

  it('F4: activity consumes stock and adds CostEntry (path A)', async () => {
    const activityRes = await request(server)
      .post('/activities')
      .set('Cookie', adminCookies)
      .set('x-farm-id', farmId)
      .send({
        cropSeasonId: seasonId,
        fieldId,
        activityType: 'FERTILIZATION',
        date: '2025-09-02',
        inputs: [{ productId, quantity: activityQty }],
      })
      .expect(201);

    expect(commandResult<{ id: string }>(activityRes).id).toBeTruthy();

    const balancesRes = await request(server)
      .get('/stock-balances')
      .set('Cookie', adminCookies)
      .set('x-farm-id', farmId)
      .query({ perPage: 50 })
      .expect(200);

    const balance = listResults<{ productId: string; quantityOnHand: string }>(
      balancesRes,
    ).find((b) => b.productId === productId);
    expect(balance?.quantityOnHand).toBe('50');

    const costingRes = await request(server)
      .get(`/crop-seasons/${seasonId}/costing`)
      .set('Cookie', adminCookies)
      .set('x-farm-id', farmId)
      .expect(200);

    const costing = commandResult<{
      totalCostInCents: number;
      breakdownBySource: { sourceType: string; amountInCents: number }[];
    }>(costingRes);

    expect(costing.totalCostInCents).toBe(activityCostCents);
    const activitySource = costing.breakdownBySource.find(
      (s) => s.sourceType === 'ACTIVITY_INPUT',
    );
    expect(activitySource?.amountInCents).toBe(activityCostCents);
  });

  it('F5: expense allocation adds CostEntry (path B)', async () => {
    await request(server)
      .post('/expenses')
      .set('Cookie', adminCookies)
      .set('x-farm-id', farmId)
      .send({
        type: 'GENERIC',
        date: '2025-09-03',
        generic: { subtype: 'GENERAL_EXPENSE' },
        installments: [
          {
            valueInCents: expenseCents,
            dueDate: '2025-09-15',
            paymentForm: 'TRANSFER',
          },
        ],
        allocations: [
          {
            costCenterId,
            accountPlanId,
            costCategoryId: energiaCategoryId,
            cropSeasonId: seasonId,
            fieldId,
            allocatedValueInCents: expenseCents,
          },
        ],
      })
      .expect(201);

    const costingRes = await request(server)
      .get(`/crop-seasons/${seasonId}/costing`)
      .set('Cookie', adminCookies)
      .set('x-farm-id', farmId)
      .expect(200);

    const costing = commandResult<{
      totalCostInCents: number;
      breakdownBySource: { sourceType: string; amountInCents: number }[];
    }>(costingRes);

    expect(costing.totalCostInCents).toBe(activityCostCents + expenseCents);
    const allocationSource = costing.breakdownBySource.find(
      (s) => s.sourceType === 'ALLOCATION',
    );
    expect(allocationSource?.amountInCents).toBe(expenseCents);
  });

  it('F6: harvest records volume without CostEntry (DC-04)', async () => {
    const harvestRes = await request(server)
      .post('/harvests')
      .set('Cookie', adminCookies)
      .set('x-farm-id', farmId)
      .send({
        cropSeasonId: seasonId,
        fieldId,
        date: '2025-10-01',
        items: [{ qualityClass: 'EXPORT', quantity: harvestQty }],
      })
      .expect(201);

    expect(commandResult<{ id: string }>(harvestRes).id).toBeTruthy();

    const costingBeforeClose = commandResult<{
      totalCostInCents: number;
      harvestedQuantity: string;
    }>(
      await request(server)
        .get(`/crop-seasons/${seasonId}/costing`)
        .set('Cookie', adminCookies)
        .set('x-farm-id', farmId)
        .expect(200),
    );

    expect(costingBeforeClose.harvestedQuantity).toBe(harvestQty);
    expect(costingBeforeClose.totalCostInCents).toBe(
      activityCostCents + expenseCents,
    );
  });

  it('F7: costing report shows per-unit cost and estimated margin', async () => {
    const referencePriceCents = 5000;
    const expectedCostPerUnit = Math.round(
      (activityCostCents + expenseCents) / Number(harvestQty),
    );
    const expectedMargin = referencePriceCents - expectedCostPerUnit;

    await request(server)
      .put(`/crop-seasons/${seasonId}/reference-price`)
      .set('Cookie', adminCookies)
      .set('x-farm-id', farmId)
      .send({ referenceSalePriceInCents: referencePriceCents })
      .expect(200);

    const costingRes = await request(server)
      .get(`/crop-seasons/${seasonId}/costing`)
      .set('Cookie', adminCookies)
      .set('x-farm-id', farmId)
      .expect(200);

    const costing = commandResult<{
      source: string;
      status: string;
      costPerHaInCents: number | null;
      costPerUnitInCents: number | null;
      referenceSalePriceInCents: number | null;
      estimatedMarginPerUnitInCents: number | null;
      byField: { fieldId: string; harvestedQuantity: string }[];
    }>(costingRes);

    expect(costing.source).toBe('LIVE');
    expect(costing.status).toBe('ACTIVE');
    expect(costing.costPerHaInCents).not.toBeNull();
    expect(costing.costPerUnitInCents).toBe(expectedCostPerUnit);
    expect(costing.referenceSalePriceInCents).toBe(referencePriceCents);
    expect(costing.estimatedMarginPerUnitInCents).toBe(expectedMargin);

    const fieldRow = costing.byField.find((f) => f.fieldId === fieldId);
    expect(fieldRow?.harvestedQuantity).toBe(harvestQty);
  });

  it('closes season (snapshot) and blocks writes on CLOSED season (INV-CLOSE)', async () => {
    const closeRes = await request(server)
      .patch(`/crop-seasons/${seasonId}/close`)
      .set('Cookie', adminCookies)
      .set('x-farm-id', farmId)
      .expect(200);

    const closed = commandResult<{
      status: string;
      source: string;
      closedAt: string | null;
    }>(closeRes);

    expect(closed.status).toBe('CLOSED');
    expect(closed.source).toBe('SNAPSHOT');
    expect(closed.closedAt).toBeTruthy();

    const snapshotCosting = commandResult<{ source: string; status: string }>(
      await request(server)
        .get(`/crop-seasons/${seasonId}/costing`)
        .set('Cookie', adminCookies)
        .set('x-farm-id', farmId)
        .expect(200),
    );

    expect(snapshotCosting.status).toBe('CLOSED');
    expect(snapshotCosting.source).toBe('SNAPSHOT');

    await request(server)
      .post('/activities')
      .set('Cookie', adminCookies)
      .set('x-farm-id', farmId)
      .send({
        cropSeasonId: seasonId,
        fieldId,
        activityType: 'OTHER',
        date: '2025-10-02',
        inputs: [{ productId, quantity: '1' }],
      })
      .expect(409);
  });
});
