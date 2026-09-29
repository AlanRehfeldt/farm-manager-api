import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import { Role } from '@prisma/client';
import { Server } from 'node:http';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/common/prisma/prisma.service';
import { changePassword } from './helpers/change-password';
import { insertUser } from './helpers/insert-user';
import { provisionOrganization } from './helpers/provision-organization';

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

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());
    await app.init();
    server = app.getHttpServer() as Server;
    prisma = app.get(PrismaService);

    const provisioned = await provisionOrganization(server, prisma, {
      organizationName: 'Rehfeldt Agro',
      farmName: 'Sede',
      adminName: 'Onboard Owner',
      adminEmail: ownerEmail,
      adminPassword: ownerPassword,
    });
    ownerCookies = provisioned.adminCookies;
    organizationId = provisioned.organizationId;
    farmId = provisioned.farmId;

    const farmsRes = await request(server)
      .get('/farms')
      .set('Cookie', ownerCookies)
      .expect(200);

    const farms = listResults<{ id: string }>(farmsRes);
    expect(farms).toHaveLength(1);
    expect(farms[0]?.id).toBe(farmId);

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

    const operatorLogin = await request(server)
      .post('/auth/login')
      .send({ email: operatorEmail, password: operatorPassword })
      .expect(201);
    operatorCookies = await changePassword(
      server,
      cookieHeader(operatorLogin),
      operatorPassword,
      'OnboardOp2!x',
    );

    expect(commandResult<{ id: string }>(createMembershipRes).id).toBeTruthy();
  });

  afterAll(async () => {
    await app.close();
  });

  it('rejects a second farm through onboarding when the organization already has one', async () => {
    await request(server)
      .post('/onboarding')
      .set('Cookie', ownerCookies)
      .send({ farmName: 'Other Farm' })
      .expect(409);
  });

  it('rejects onboarding when the user has no organization', async () => {
    const email = `onboard.none.${suffix}@example.com`;
    const password = 'Nobody1!x';
    await insertUser(prisma, {
      name: 'No Organization',
      email,
      password,
    });

    const login = await request(server)
      .post('/auth/login')
      .send({ email, password })
      .expect(201);

    await request(server)
      .post('/onboarding')
      .set('Cookie', cookieHeader(login))
      .send({ farmName: 'Sede' })
      .expect(409);
  });

  it('creates only the first farm for an organization that has none', async () => {
    const email = `onboard.first.${suffix}@example.com`;
    const password = 'First1!x';
    const user = await insertUser(prisma, {
      name: 'First Farm Admin',
      email,
      password,
    });
    const organization = await prisma.organization.create({
      data: { name: `Empty Org ${suffix}` },
    });
    await prisma.membership.create({
      data: {
        userId: user.id,
        organizationId: organization.id,
        farmId: null,
        role: Role.ADMIN,
      },
    });

    const login = await request(server)
      .post('/auth/login')
      .send({ email, password })
      .expect(201);
    const cookies = cookieHeader(login);

    const res = await request(server)
      .post('/onboarding')
      .set('Cookie', cookies)
      .send({ farmName: `Primeira ${suffix}` })
      .expect(201);

    const created = commandResult<{
      organization: { id: string };
      farm: { id: string; organizationId: string };
    }>(res);

    expect(created.organization.id).toBe(organization.id);
    expect(created.farm.organizationId).toBe(organization.id);

    await request(server)
      .post('/onboarding')
      .set('Cookie', cookies)
      .send({ farmName: `Segunda ${suffix}` })
      .expect(409);
  });

  it('rejects onboarding from a user who is not an org-wide admin', async () => {
    const email = `onboard.user.${suffix}@example.com`;
    const password = 'Member1!x';
    const user = await insertUser(prisma, {
      name: 'Org Wide User',
      email,
      password,
    });
    const organization = await prisma.organization.create({
      data: { name: `User Org ${suffix}` },
    });
    await prisma.membership.create({
      data: {
        userId: user.id,
        organizationId: organization.id,
        farmId: null,
        role: Role.USER,
      },
    });

    const login = await request(server)
      .post('/auth/login')
      .send({ email, password })
      .expect(201);

    await request(server)
      .post('/onboarding')
      .set('Cookie', cookieHeader(login))
      .send({ farmName: `Sede ${suffix}` })
      .expect(403);
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
});
