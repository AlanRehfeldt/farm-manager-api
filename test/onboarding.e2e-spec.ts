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

function listTotal(res: request.Response): number {
  return (res.body as ApiListResponse<unknown>).total;
}

function cookieHeader(res: request.Response): string {
  const setCookie = res.headers['set-cookie'];
  if (!setCookie) {
    throw new Error('Missing Set-Cookie header');
  }
  const cookies = Array.isArray(setCookie) ? setCookie : [setCookie];
  return cookies.map((cookie: string) => cookie.split(';')[0]).join('; ');
}

describe('Onboarding (e2e)', () => {
  let app: INestApplication;
  let server: Server;
  let prisma: PrismaService;

  const suffix = `${Date.now()}`;
  const ownerEmail = `onboard.owner.${suffix}@example.com`;
  const ownerPassword = 'Owner1!x';
  const operatorEmail = `onboard.op.${suffix}@example.com`;
  const operatorPassword = 'Operat1!x';

  let ownerCookies: string;
  let operatorCookies: string;
  let organizationId: string;
  let farmId: string;
  let operatorMembershipId: string;

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
      name: 'Onboard Owner',
      email: ownerEmail,
      password: ownerPassword,
    });

    const ownerLogin = await request(server)
      .post('/auth/login')
      .send({ email: ownerEmail, password: ownerPassword })
      .expect(201);
    ownerCookies = cookieHeader(ownerLogin);

    const onboardingRes = await request(server)
      .post('/onboarding')
      .set('Cookie', ownerCookies)
      .send({
        organizationName: 'Rehfeldt Agro',
        farmName: 'Sede',
      })
      .expect(201);

    const onboarding = commandResult<{
      organization: { id: string; name: string };
      farm: { id: string; name: string; organizationId: string };
    }>(onboardingRes);

    organizationId = onboarding.organization.id;
    farmId = onboarding.farm.id;

    const farmsRes = await request(server)
      .get('/farms')
      .set('Cookie', ownerCookies)
      .expect(200);

    const farms = listResults<{ id: string; name: string }>(farmsRes);
    expect(farms).toHaveLength(1);
    expect(farms[0]?.id).toBe(farmId);

    await request(server)
      .post('/onboarding')
      .set('Cookie', ownerCookies)
      .send({
        organizationName: 'Another Org',
        farmName: 'Other Farm',
      })
      .expect(409);

    const createMembershipRes = await request(server)
      .post('/memberships')
      .set('Cookie', ownerCookies)
      .send({
        organizationId,
        farmId,
        role: 'USER',
        name: 'Onboard Operator',
        email: operatorEmail,
        password: operatorPassword,
      })
      .expect(201);

    const membership = commandResult<{ id: string; userId: string }>(
      createMembershipRes,
    );
    operatorMembershipId = membership.id;

    const membershipsRes = await request(server)
      .get('/memberships')
      .query({ organizationId })
      .set('Cookie', ownerCookies)
      .expect(200);

    const memberships = listResults<{
      id: string;
      user: { name: string; email: string };
    }>(membershipsRes);

    const operatorMembership = memberships.find(
      (item) => item.id === operatorMembershipId,
    );
    expect(operatorMembership?.user.name).toBe('Onboard Operator');
    expect(operatorMembership?.user.email).toBe(operatorEmail);

    const operatorLogin = await request(server)
      .post('/auth/login')
      .send({ email: operatorEmail, password: operatorPassword })
      .expect(201);
    operatorCookies = cookieHeader(operatorLogin);
  });

  afterAll(async () => {
    await app.close();
  });

  it('operator cannot list memberships (403)', async () => {
    await request(server)
      .get('/memberships')
      .query({ organizationId })
      .set('Cookie', operatorCookies)
      .expect(403);
  });

  it('operator cannot create memberships (403)', async () => {
    await request(server)
      .post('/memberships')
      .set('Cookie', operatorCookies)
      .send({
        organizationId,
        farmId,
        role: 'USER',
        name: 'Blocked User',
        email: `blocked.${suffix}@example.com`,
        password: 'Blocked1!x',
      })
      .expect(403);
  });

  it('operator only sees assigned farm', async () => {
    const farmsRes = await request(server)
      .get('/farms')
      .set('Cookie', operatorCookies)
      .expect(200);

    const farms = listResults<{ id: string }>(farmsRes);
    expect(farms).toHaveLength(1);
    expect(farms[0]?.id).toBe(farmId);
  });

  it('onboarding seeds cost categories for the organization', async () => {
    const categoriesRes = await request(server)
      .get('/cost-categories')
      .set('Cookie', ownerCookies)
      .set('x-farm-id', farmId)
      .query({ perPage: 50 })
      .expect(200);

    const categories = listResults<{ code: string; name: string }>(
      categoriesRes,
    );

    expect(listTotal(categoriesRes)).toBe(11);
    expect(categories).toHaveLength(11);

    const codes = categories.map((item) => item.code).sort();
    expect(codes).toEqual([
      'MO_fixa',
      'MO_temporaria',
      'combustivel',
      'defensivo',
      'energia_irrigacao',
      'fertilizante',
      'formacao',
      'maquina',
      'muda',
      'outros',
      'servicos',
    ]);
  });
});
