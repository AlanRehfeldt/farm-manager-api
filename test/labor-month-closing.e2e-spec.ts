import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import { Server } from 'node:http';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/common/prisma/prisma.service';
import { changePassword } from './helpers/change-password';
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

/**
 * PR-32/33: labor month closing authz, reopen cycle, regime change, DC-02.
 */
describe('Labor month closing (e2e)', () => {
  let app: INestApplication;
  let server: Server;
  let prisma: PrismaService;

  const suffix = `${Date.now()}`;
  const orgAdminEmail = `labor.org.${suffix}@example.com`;
  const orgAdminPassword = 'OrgAdm1!x';
  const farmAdminEmail = `labor.farm.${suffix}@example.com`;
  const farmAdminPassword = 'FarmAd1!x';
  const farmAdminNextPassword = 'FarmAd2!x';

  const salaryInCents = 320000;
  const year = 2026;
  const month = 9;
  const salaryMonth = 10;

  let orgAdminCookies: string;
  let farmAdminCookies: string;
  let organizationId: string;
  let farmId: string;
  let seasonId: string;
  let fieldId: string;
  let employeeId: string;
  let salaryEmployeeId: string;
  let kgUomId: string;
  let cropId: string;
  let activityAId: string;
  let activityBId: string;
  let costCenterId: string;
  let accountPlanId: string;
  let closingId: string;

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
      name: 'Labor Org Admin',
      email: orgAdminEmail,
      password: orgAdminPassword,
    });

    const loginOrg = await request(server)
      .post('/auth/login')
      .send({ email: orgAdminEmail, password: orgAdminPassword })
      .expect(201);
    orgAdminCookies = cookieHeader(loginOrg);

    const onboardingRes = await request(server)
      .post('/onboarding')
      .set('Cookie', orgAdminCookies)
      .send({
        organizationName: `Labor Org ${suffix}`,
        farmName: `Fazenda ${suffix}`,
      })
      .expect(201);

    const onboarded = commandResult<{
      organization: { id: string };
      farm: { id: string };
    }>(onboardingRes);
    organizationId = onboarded.organization.id;
    farmId = onboarded.farm.id;

    const farmAdminRes = await request(server)
      .post('/memberships')
      .set('Cookie', orgAdminCookies)
      .send({
        organizationId,
        farmIds: [farmId],
        role: 'ADMIN',
        name: 'Farm Scoped Admin',
        email: farmAdminEmail,
        password: farmAdminPassword,
      })
      .expect(201);
    expect(commandResult<{ userId: string }>(farmAdminRes).userId).toBeTruthy();

    const loginFarm = await request(server)
      .post('/auth/login')
      .send({ email: farmAdminEmail, password: farmAdminPassword })
      .expect(201);
    farmAdminCookies = await changePassword(
      server,
      cookieHeader(loginFarm),
      farmAdminPassword,
      farmAdminNextPassword,
    );

    const uomRes = await request(server)
      .post('/unit-of-measurements')
      .set('Cookie', orgAdminCookies)
      .set('x-farm-id', farmId)
      .send({
        name: 'Quilograma',
        acronym: `kg-l${suffix}`.slice(0, 20),
        dimension: 'MASS',
        isBase: true,
        factorToBase: '1',
      })
      .expect(201);
    kgUomId = commandResult<{ id: string }>(uomRes).id;

    const cropRes = await request(server)
      .post('/crops')
      .set('Cookie', orgAdminCookies)
      .set('x-farm-id', farmId)
      .send({ name: 'Manga Labor', defaultProductionUomId: kgUomId })
      .expect(201);
    cropId = commandResult<{ id: string }>(cropRes).id;

    const fieldRes = await request(server)
      .post('/fields')
      .set('Cookie', orgAdminCookies)
      .set('x-farm-id', farmId)
      .send({ name: 'Talhao Labor', areaHa: 10 })
      .expect(201);
    fieldId = commandResult<{ id: string }>(fieldRes).id;

    const seasonRes = await request(server)
      .post('/crop-seasons')
      .set('Cookie', orgAdminCookies)
      .set('x-farm-id', farmId)
      .send({
        name: 'Safra Labor 26',
        cropId,
        startDate: '2026-08-01',
        productionUomId: kgUomId,
      })
      .expect(201);
    seasonId = commandResult<{ id: string }>(seasonRes).id;

    await request(server)
      .post('/crop-plantings')
      .set('Cookie', orgAdminCookies)
      .set('x-farm-id', farmId)
      .send({ cropSeasonId: seasonId, fieldId })
      .expect(201);

    await request(server)
      .patch(`/crop-seasons/${seasonId}/activate`)
      .set('Cookie', orgAdminCookies)
      .set('x-farm-id', farmId)
      .expect(200);

    const ccRes = await request(server)
      .post('/cost-centers')
      .set('Cookie', orgAdminCookies)
      .set('x-farm-id', farmId)
      .send({
        name: 'Centro Labor',
        description: 'Centro de custo labor',
        code: `CC-${suffix}`,
      })
      .expect(201);
    costCenterId = commandResult<{ id: string }>(ccRes).id;

    const apRes = await request(server)
      .post('/account-plans')
      .set('Cookie', orgAdminCookies)
      .set('x-farm-id', farmId)
      .send({
        name: 'Plano Labor',
        description: 'Plano de contas labor',
        code: `AP-${suffix}`,
      })
      .expect(201);
    accountPlanId = commandResult<{ id: string }>(apRes).id;

    const employeeRes = await request(server)
      .post('/employees')
      .set('Cookie', orgAdminCookies)
      .set('x-farm-id', farmId)
      .send({
        name: 'Colaborador CLT',
        registration: `L${suffix}`.slice(0, 20),
        type: 'FIELD_WORKER',
        employmentType: 'CLT',
        monthlySalaryInCents: salaryInCents,
        expectedMonthlyHours: '160',
      })
      .expect(201);
    employeeId = commandResult<{ id: string }>(employeeRes).id;

    const salaryEmployeeRes = await request(server)
      .post('/employees')
      .set('Cookie', orgAdminCookies)
      .set('x-farm-id', farmId)
      .send({
        name: 'Colaborador Salario',
        registration: `S${suffix}`.slice(0, 20),
        type: 'FIELD_WORKER',
        employmentType: 'CLT',
        monthlySalaryInCents: salaryInCents,
        expectedMonthlyHours: '160',
      })
      .expect(201);
    salaryEmployeeId = commandResult<{ id: string }>(salaryEmployeeRes).id;

    const activityARes = await request(server)
      .post('/activities')
      .set('Cookie', orgAdminCookies)
      .set('x-farm-id', farmId)
      .send({
        cropSeasonId: seasonId,
        fieldId,
        activityType: 'MANAGEMENT',
        date: `${year}-${String(month).padStart(2, '0')}-10`,
        inputs: [],
        labor: [
          {
            employeeId,
            payBasis: 'HOUR',
            hours: '80',
          },
        ],
        machineHours: [],
      })
      .expect(201);
    activityAId = commandResult<{ id: string }>(activityARes).id;

    const activityBRes = await request(server)
      .post('/activities')
      .set('Cookie', orgAdminCookies)
      .set('x-farm-id', farmId)
      .send({
        cropSeasonId: seasonId,
        fieldId,
        activityType: 'MANAGEMENT',
        date: `${year}-${String(month).padStart(2, '0')}-15`,
        inputs: [],
        labor: [
          {
            employeeId,
            payBasis: 'HOUR',
            hours: '80',
          },
        ],
        machineHours: [],
      })
      .expect(201);
    activityBId = commandResult<{ id: string }>(activityBRes).id;
  }, 90000);

  afterAll(async () => {
    await app.close();
  });

  it('returns 403 for farm-scoped ADMIN on preview and close', async () => {
    await request(server)
      .get('/labor-month-closings/preview')
      .query({ year, month })
      .set('Cookie', farmAdminCookies)
      .set('x-farm-id', farmId)
      .expect(403);

    await request(server)
      .post('/labor-month-closings')
      .set('Cookie', farmAdminCookies)
      .set('x-farm-id', farmId)
      .send({ year, month })
      .expect(403);
  });

  it('blocks employment type change while open CLT hours exist', async () => {
    await request(server)
      .put(`/employees/${employeeId}`)
      .set('Cookie', orgAdminCookies)
      .set('x-farm-id', farmId)
      .send({ employmentType: 'CONTRACTOR' })
      .expect(409);
  });

  it('allows org-wide ADMIN to preview, close, reopen and reclose', async () => {
    const previewRes = await request(server)
      .get('/labor-month-closings/preview')
      .query({ year, month })
      .set('Cookie', orgAdminCookies)
      .set('x-farm-id', farmId)
      .expect(200);

    const preview = commandResult<{
      employees: { employeeId: string; salaryInCents: number }[];
      closings: { id: string }[];
    }>(previewRes);
    expect(preview.employees).toHaveLength(1);
    expect(preview.employees[0].employeeId).toBe(employeeId);
    expect(preview.employees[0].salaryInCents).toBe(salaryInCents);
    expect(preview.closings).toHaveLength(0);

    const closeRes = await request(server)
      .post('/labor-month-closings')
      .set('Cookie', orgAdminCookies)
      .set('x-farm-id', farmId)
      .send({ year, month })
      .expect(201);

    const closed = commandResult<{
      closedCount: number;
      employees: { closingId: string }[];
    }>(closeRes);
    expect(closed.closedCount).toBe(1);
    closingId = closed.employees[0].closingId;

    await request(server)
      .post('/labor-month-closings')
      .set('Cookie', orgAdminCookies)
      .set('x-farm-id', farmId)
      .send({ year, month })
      .expect(409);

    const closedPreviewRes = await request(server)
      .get('/labor-month-closings/preview')
      .query({ year, month })
      .set('Cookie', orgAdminCookies)
      .set('x-farm-id', farmId)
      .expect(200);
    const closedPreview = commandResult<{
      employees: unknown[];
      closings: { id: string; employeeId: string }[];
    }>(closedPreviewRes);
    expect(closedPreview.employees).toHaveLength(0);
    expect(closedPreview.closings).toHaveLength(1);
    expect(closedPreview.closings[0].id).toBe(closingId);

    await request(server)
      .patch(`/labor-month-closings/${closingId}/reopen`)
      .set('Cookie', farmAdminCookies)
      .set('x-farm-id', farmId)
      .send({ reason: 'Farm admin cannot reopen' })
      .expect(403);

    await request(server)
      .patch(`/labor-month-closings/${closingId}/reopen`)
      .set('Cookie', orgAdminCookies)
      .set('x-farm-id', farmId)
      .send({ reason: 'Need to redistribute after correction' })
      .expect(200);

    const reopenPreviewRes = await request(server)
      .get('/labor-month-closings/preview')
      .query({ year, month })
      .set('Cookie', orgAdminCookies)
      .set('x-farm-id', farmId)
      .expect(200);
    const reopenPreview = commandResult<{
      employees: { employeeId: string; totalHours: string }[];
      closings: unknown[];
    }>(reopenPreviewRes);
    expect(reopenPreview.closings).toHaveLength(0);
    expect(reopenPreview.employees).toHaveLength(1);
    expect(reopenPreview.employees[0].totalHours).toBe('160');

    const recloseRes = await request(server)
      .post('/labor-month-closings')
      .set('Cookie', orgAdminCookies)
      .set('x-farm-id', farmId)
      .send({ year, month })
      .expect(201);
    const reclosed = commandResult<{
      closedCount: number;
      employees: { closingId: string; salaryInCents: number }[];
    }>(recloseRes);
    expect(reclosed.closedCount).toBe(1);
    expect(reclosed.employees[0].salaryInCents).toBe(salaryInCents);
    closingId = reclosed.employees[0].closingId;
  });

  it('reconciles costing after reversing closed activity, reopen and reclose', async () => {
    await request(server)
      .post(`/activities/${activityAId}/reverse`)
      .set('Cookie', orgAdminCookies)
      .set('x-farm-id', farmId)
      .send({ reason: 'Atividade lançada por engano' })
      .expect(201);

    await request(server)
      .patch(`/labor-month-closings/${closingId}/reopen`)
      .set('Cookie', orgAdminCookies)
      .set('x-farm-id', farmId)
      .send({ reason: 'Redistribuir salário após estorno' })
      .expect(200);

    const previewRes = await request(server)
      .get('/labor-month-closings/preview')
      .query({ year, month })
      .set('Cookie', orgAdminCookies)
      .set('x-farm-id', farmId)
      .expect(200);
    const preview = commandResult<{
      employees: { totalHours: string; salaryInCents: number }[];
    }>(previewRes);
    expect(preview.employees).toHaveLength(1);
    expect(preview.employees[0].totalHours).toBe('80');

    await request(server)
      .post('/labor-month-closings')
      .set('Cookie', orgAdminCookies)
      .set('x-farm-id', farmId)
      .send({ year, month })
      .expect(201);

    const moSum = await prisma.costEntry.aggregate({
      where: {
        cropSeasonId: seasonId,
        costCategory: { code: 'MO_fixa' },
        reversedAt: null,
        sourceType: { not: 'REVERSAL' },
      },
      _sum: { amountInCents: true },
    });
    expect(Number(moSum._sum.amountInCents ?? 0n)).toBe(salaryInCents);
  });

  it('does not block SALARY_PAYMENT after reversed open CLT activity', async () => {
    const activityRes = await request(server)
      .post('/activities')
      .set('Cookie', orgAdminCookies)
      .set('x-farm-id', farmId)
      .send({
        cropSeasonId: seasonId,
        fieldId,
        activityType: 'MANAGEMENT',
        date: `${year}-${String(salaryMonth).padStart(2, '0')}-05`,
        inputs: [],
        labor: [
          {
            employeeId: salaryEmployeeId,
            payBasis: 'HOUR',
            hours: '8',
          },
        ],
        machineHours: [],
      })
      .expect(201);
    const activityId = commandResult<{ id: string }>(activityRes).id;

    await request(server)
      .post(`/activities/${activityId}/reverse`)
      .set('Cookie', orgAdminCookies)
      .set('x-farm-id', farmId)
      .send({ reason: 'Horas lançadas por engano' })
      .expect(201);

    const costCategory = await prisma.costCategory.findFirst({
      where: { organizationId, code: 'outros' },
    });
    expect(costCategory).toBeTruthy();

    await request(server)
      .post('/expenses')
      .set('Cookie', orgAdminCookies)
      .set('x-farm-id', farmId)
      .send({
        type: 'SALARY_PAYMENT',
        date: `${year}-${String(salaryMonth).padStart(2, '0')}-20`,
        salary: { employeeId: salaryEmployeeId },
        installments: [
          {
            dueDate: `${year}-${String(salaryMonth).padStart(2, '0')}-20`,
            valueInCents: salaryInCents,
            paymentForm: 'TRANSFER',
          },
        ],
        allocations: [
          {
            farmId,
            cropSeasonId: seasonId,
            fieldId,
            costCenterId,
            accountPlanId,
            costCategoryId: costCategory!.id,
            allocatedValueInCents: salaryInCents,
          },
        ],
      })
      .expect(201);
  });

  it('includes MO_fixa in season costing snapshot after labor close', async () => {
    const closeSeasonRes = await request(server)
      .patch(`/crop-seasons/${seasonId}/close`)
      .set('Cookie', orgAdminCookies)
      .set('x-farm-id', farmId)
      .expect(200);

    const snapshot = commandResult<{
      totalCostInCents: number;
      source: string;
      breakdownByCategory: { code: string; amountInCents: number }[];
    }>(closeSeasonRes);

    expect(snapshot.source).toBe('SNAPSHOT');

    const moFixa = snapshot.breakdownByCategory.find(
      (category) => category.code === 'MO_fixa',
    );
    expect(moFixa?.amountInCents).toBe(salaryInCents);
  });
});
