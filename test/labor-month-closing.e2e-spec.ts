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
 * PR-32: labor month closing requires org-wide ADMIN; concurrent close returns 409;
 * closed season snapshot includes MO after labor close.
 */
describe('Labor month closing (e2e)', () => {
  let app: INestApplication;
  let server: Server;

  const suffix = `${Date.now()}`;
  const orgAdminEmail = `labor.org.${suffix}@example.com`;
  const orgAdminPassword = 'OrgAdm1!x';
  const farmAdminEmail = `labor.farm.${suffix}@example.com`;
  const farmAdminPassword = 'FarmAd1!x';
  const farmAdminNextPassword = 'FarmAd2!x';

  const salaryInCents = 320000;
  const year = 2026;
  const month = 9;

  let orgAdminCookies: string;
  let farmAdminCookies: string;
  let organizationId: string;
  let farmId: string;
  let seasonId: string;
  let fieldId: string;
  let employeeId: string;
  let kgUomId: string;
  let cropId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());
    await app.init();
    server = app.getHttpServer() as Server;

    await insertUser(app.get(PrismaService), {
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

    await request(server)
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
            hours: '160',
          },
        ],
        machineHours: [],
      })
      .expect(201);
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

  it('allows org-wide ADMIN to preview, close once, and reject second close with 409', async () => {
    const previewRes = await request(server)
      .get('/labor-month-closings/preview')
      .query({ year, month })
      .set('Cookie', orgAdminCookies)
      .set('x-farm-id', farmId)
      .expect(200);

    const preview = commandResult<{
      employees: { employeeId: string; salaryInCents: number }[];
    }>(previewRes);
    expect(preview.employees).toHaveLength(1);
    expect(preview.employees[0].employeeId).toBe(employeeId);
    expect(preview.employees[0].salaryInCents).toBe(salaryInCents);

    const closeRes = await request(server)
      .post('/labor-month-closings')
      .set('Cookie', orgAdminCookies)
      .set('x-farm-id', farmId)
      .send({ year, month })
      .expect(201);

    const closed = commandResult<{ closedCount: number }>(closeRes);
    expect(closed.closedCount).toBe(1);

    await request(server)
      .post('/labor-month-closings')
      .set('Cookie', orgAdminCookies)
      .set('x-farm-id', farmId)
      .send({ year, month })
      .expect(409);
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
    expect(snapshot.totalCostInCents).toBe(salaryInCents);

    const moFixa = snapshot.breakdownByCategory.find(
      (category) => category.code === 'MO_fixa',
    );
    expect(moFixa?.amountInCents).toBe(salaryInCents);
  });
});
