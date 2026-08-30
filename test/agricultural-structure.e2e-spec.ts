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

describe('Agricultural structure (e2e)', () => {
  let app: INestApplication;
  let server: Server;
  let prisma: PrismaService;

  const suffix = `${Date.now()}`;
  const adminEmail = `agri.admin.${suffix}@example.com`;
  const adminPassword = 'Admin1!x';
  const outsiderEmail = `agri.out.${suffix}@example.com`;
  const outsiderPassword = 'Outsid1!';

  let adminCookies: string;
  let outsiderCookies: string;
  let organizationId: string;
  let farmId: string;
  let otherFarmId: string;
  let kgUomId: string;
  let cropId: string;
  let varietyId: string;
  let fieldT1Id: string;
  let fieldT2Id: string;
  let seasonId: string;

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
      name: 'Agri Admin',
      email: adminEmail,
      password: adminPassword,
    });

    await insertUser(prisma, {
      name: 'Agri Outsider',
      email: outsiderEmail,
      password: outsiderPassword,
    });

    const loginAdmin = await request(server)
      .post('/auth/login')
      .send({ email: adminEmail, password: adminPassword })
      .expect(201);
    adminCookies = cookieHeader(loginAdmin);

    const loginOutsider = await request(server)
      .post('/auth/login')
      .send({ email: outsiderEmail, password: outsiderPassword })
      .expect(201);
    outsiderCookies = cookieHeader(loginOutsider);

    const orgRes = await request(server)
      .post('/organizations')
      .set('Cookie', adminCookies)
      .send({ name: `Agri Org ${suffix}` })
      .expect(201);
    organizationId = commandResult<{ id: string }>(orgRes).id;

    const farmRes = await request(server)
      .post('/farms')
      .set('Cookie', adminCookies)
      .send({ organizationId, name: `Sede ${suffix}` })
      .expect(201);
    farmId = commandResult<{ id: string }>(farmRes).id;

    const otherFarmRes = await request(server)
      .post('/farms')
      .set('Cookie', adminCookies)
      .send({ organizationId, name: `Norte ${suffix}` })
      .expect(201);
    otherFarmId = commandResult<{ id: string }>(otherFarmRes).id;

    const uomRes = await request(server)
      .post('/unit-of-measurements')
      .set('Cookie', adminCookies)
      .set('x-farm-id', farmId)
      .send({ name: 'Quilograma', acronym: `kg-${suffix}` })
      .expect(201);
    kgUomId = commandResult<{ id: string }>(uomRes).id;

    const cropRes = await request(server)
      .post('/crops')
      .set('Cookie', adminCookies)
      .set('x-farm-id', farmId)
      .send({ name: 'Manga', defaultProductionUomId: kgUomId })
      .expect(201);
    cropId = commandResult<{ id: string }>(cropRes).id;

    const varietyRes = await request(server)
      .post('/varieties')
      .set('Cookie', adminCookies)
      .set('x-farm-id', farmId)
      .send({ cropId, name: 'Tommy' })
      .expect(201);
    varietyId = commandResult<{ id: string }>(varietyRes).id;

    const fieldT1Res = await request(server)
      .post('/fields')
      .set('Cookie', adminCookies)
      .set('x-farm-id', farmId)
      .send({ name: 'T1', areaHa: 85.5 })
      .expect(201);
    fieldT1Id = commandResult<{ id: string; areaHa: string }>(fieldT1Res).id;

    const fieldT2Res = await request(server)
      .post('/fields')
      .set('Cookie', adminCookies)
      .set('x-farm-id', farmId)
      .send({ name: 'T2', areaHa: 40 })
      .expect(201);
    fieldT2Id = commandResult<{ id: string }>(fieldT2Res).id;

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
    seasonId = commandResult<{ id: string; status: string }>(seasonRes).id;
  });

  afterAll(async () => {
    await app.close();
  });

  it('rejects field with areaHa <= 0', async () => {
    await request(server)
      .post('/fields')
      .set('Cookie', adminCookies)
      .set('x-farm-id', farmId)
      .send({ name: 'Invalid', areaHa: 0 })
      .expect(400);
  });

  it('creates field with decimal areaHa', async () => {
    const res = await request(server)
      .post('/fields')
      .set('Cookie', adminCookies)
      .set('x-farm-id', farmId)
      .send({ name: 'T12', areaHa: 85.5 })
      .expect(201);

    expect(commandResult<{ areaHa: string }>(res).areaHa).toBe('85.5');
  });

  it('creates crop season in PLANNED with crop summary', async () => {
    const res = await request(server)
      .get(`/crop-seasons/${seasonId}`)
      .set('Cookie', adminCookies)
      .set('x-farm-id', farmId)
      .expect(200);

    const season = commandResult<{
      status: string;
      name: string;
      crop: { id: string; name: string };
    }>(res);

    expect(season.status).toBe('PLANNED');
    expect(season.name).toBe('Manga 25/26');
    expect(season.crop).toEqual({ id: cropId, name: 'Manga' });
  });

  it('creates crop plantings and rejects duplicate field link', async () => {
    await request(server)
      .post('/crop-plantings')
      .set('Cookie', adminCookies)
      .set('x-farm-id', farmId)
      .send({ cropSeasonId: seasonId, fieldId: fieldT1Id, varietyId })
      .expect(201);

    await request(server)
      .post('/crop-plantings')
      .set('Cookie', adminCookies)
      .set('x-farm-id', farmId)
      .send({ cropSeasonId: seasonId, fieldId: fieldT2Id })
      .expect(201);

    await request(server)
      .post('/crop-plantings')
      .set('Cookie', adminCookies)
      .set('x-farm-id', farmId)
      .send({ cropSeasonId: seasonId, fieldId: fieldT1Id })
      .expect(409);
  });

  it('fails to activate crop season without plantings on a fresh season', async () => {
    const emptySeasonRes = await request(server)
      .post('/crop-seasons')
      .set('Cookie', adminCookies)
      .set('x-farm-id', farmId)
      .send({
        name: 'Empty season',
        cropId,
        startDate: '2025-09-01',
        productionUomId: kgUomId,
      })
      .expect(201);
    const emptySeasonId = commandResult<{ id: string }>(emptySeasonRes).id;

    await request(server)
      .patch(`/crop-seasons/${emptySeasonId}/activate`)
      .set('Cookie', adminCookies)
      .set('x-farm-id', farmId)
      .expect(409);
  });

  it('activates crop season when plantings exist', async () => {
    const res = await request(server)
      .patch(`/crop-seasons/${seasonId}/activate`)
      .set('Cookie', adminCookies)
      .set('x-farm-id', farmId)
      .expect(200);

    expect(commandResult<{ status: string }>(res).status).toBe('ACTIVE');
  });

  it('returns 501 for close crop season stub', async () => {
    await request(server)
      .patch(`/crop-seasons/${seasonId}/close`)
      .set('Cookie', adminCookies)
      .set('x-farm-id', farmId)
      .expect(501);
  });

  it('creates machine with hourly cost and fuel flag', async () => {
    const res = await request(server)
      .post('/machines')
      .set('Cookie', adminCookies)
      .set('x-farm-id', farmId)
      .send({
        name: 'Trator 01',
        hourlyCostInCents: 8500,
        fuelIncludedInHourlyCost: true,
      })
      .expect(201);

    const machine = commandResult<{
      hourlyCostInCents: number;
      fuelIncludedInHourlyCost: boolean;
    }>(res);

    expect(machine.hourlyCostInCents).toBe(8500);
    expect(machine.fuelIncludedInHourlyCost).toBe(true);
  });

  it('requires x-farm-id header', async () => {
    await request(server)
      .get('/fields')
      .set('Cookie', adminCookies)
      .expect(400);
  });

  it('returns 403 for outsider without membership', async () => {
    await request(server)
      .get('/fields')
      .set('Cookie', outsiderCookies)
      .set('x-farm-id', farmId)
      .expect(403);
  });

  it('returns 404 for get-by-id on another farm', async () => {
    await request(server)
      .get(`/fields/${fieldT1Id}`)
      .set('Cookie', adminCookies)
      .set('x-farm-id', otherFarmId)
      .expect(404);
  });

  it('lists fields scoped to active farm', async () => {
    const res = await request(server)
      .get('/fields')
      .set('Cookie', adminCookies)
      .set('x-farm-id', farmId)
      .expect(200);

    const results = listResults<{ name: string }>(res);
    expect(results.some((field) => field.name === 'T1')).toBe(true);
  });
});
