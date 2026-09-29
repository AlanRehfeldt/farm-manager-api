import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { OrganizationStatus, PlatformRole } from '@prisma/client';
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

describe('Organization suspension (e2e)', () => {
  let app: INestApplication;
  let server: Server;
  let prisma: PrismaService;

  const suffix = `${Date.now()}`;
  const platformEmail = `susp.vendor.${suffix}@example.com`;
  const platformPassword = 'Platfm1!x';
  const adminEmail = `susp.client.${suffix}@example.com`;
  const adminPassword = 'Client1!x';
  const nextPassword = 'Client2!x';
  const organizationName = `Suspended Org ${suffix}`;

  let platformCookies: string;
  let clientCookies: string;
  let organizationId: string;
  let farmId: string;
  let adminUserId: string;

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
      name: 'Vendor Admin',
      email: platformEmail,
      password: platformPassword,
      platformRole: PlatformRole.PLATFORM_ADMIN,
    });

    const platformLogin = await request(server)
      .post('/auth/login')
      .send({ email: platformEmail, password: platformPassword })
      .expect(201);
    platformCookies = cookieHeader(platformLogin);
  });

  afterAll(async () => {
    await app.close();
  });

  it('suspends the client organization and restores access on reactivation', async () => {
    const provisioned = await request(server)
      .post('/platform/organizations')
      .set('Cookie', platformCookies)
      .send({
        organizationName,
        farmName: `Sede ${suffix}`,
        admin: {
          name: 'Cliente Admin',
          email: adminEmail,
          password: adminPassword,
        },
      })
      .expect(201);

    const created = commandResult<{
      organization: { id: string };
      farm: { id: string };
      admin: { id: string };
    }>(provisioned);

    organizationId = created.organization.id;
    farmId = created.farm.id;
    adminUserId = created.admin.id;

    const firstLogin = await request(server)
      .post('/auth/login')
      .send({ email: adminEmail, password: adminPassword })
      .expect(201);
    clientCookies = await changePassword(
      server,
      cookieHeader(firstLogin),
      adminPassword,
      nextPassword,
    );

    const farms = await request(server)
      .get('/farms')
      .set('Cookie', clientCookies)
      .expect(200);
    expect(listResults<{ id: string }>(farms).map((farm) => farm.id)).toContain(
      farmId,
    );

    await request(server)
      .get('/fields')
      .set('Cookie', clientCookies)
      .set('x-farm-id', farmId)
      .expect(200);

    const suspended = await request(server)
      .patch(`/platform/organizations/${organizationId}/status`)
      .set('Cookie', platformCookies)
      .send({ status: 'SUSPENDED' })
      .expect(200);

    expect(commandResult<{ status: string }>(suspended)).toMatchObject({
      id: organizationId,
      status: 'SUSPENDED',
    });

    await request(server)
      .patch(`/platform/organizations/${organizationId}/status`)
      .set('Cookie', platformCookies)
      .send({ status: 'SUSPENDED' })
      .expect(200);

    const revoked = await prisma.refreshToken.count({
      where: { userId: adminUserId, revokedAt: { not: null } },
    });
    expect(revoked).toBeGreaterThan(0);

    await request(server)
      .post('/auth/login')
      .send({ email: adminEmail, password: nextPassword })
      .expect(403);

    await request(server)
      .get('/farms')
      .set('Cookie', clientCookies)
      .expect(401);

    await request(server)
      .get('/fields')
      .set('Cookie', clientCookies)
      .set('x-farm-id', farmId)
      .expect(401);

    const listed = await request(server)
      .get('/platform/organizations')
      .query({ name: organizationName })
      .set('Cookie', platformCookies)
      .expect(200);

    expect(listResults<{ id: string; status: string }>(listed)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: organizationId,
          status: OrganizationStatus.SUSPENDED,
        }),
      ]),
    );

    await request(server)
      .patch(`/platform/organizations/${organizationId}/status`)
      .set('Cookie', platformCookies)
      .send({ status: 'ACTIVE' })
      .expect(200);

    await request(server)
      .post('/auth/login')
      .send({ email: adminEmail, password: nextPassword })
      .expect(201);

    const restored = await request(server)
      .get('/farms')
      .set(
        'Cookie',
        cookieHeader(
          await request(server)
            .post('/auth/login')
            .send({ email: adminEmail, password: nextPassword })
            .expect(201),
        ),
      )
      .expect(200);

    expect(
      listResults<{ id: string }>(restored).map((farm) => farm.id),
    ).toContain(farmId);
  });

  it('returns 404 when the organization does not exist', async () => {
    await request(server)
      .patch(
        '/platform/organizations/00000000-0000-4000-8000-000000000099/status',
      )
      .set('Cookie', platformCookies)
      .send({ status: 'SUSPENDED' })
      .expect(404);
  });
});
