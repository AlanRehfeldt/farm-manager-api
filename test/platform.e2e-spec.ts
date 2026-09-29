import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import { PlatformRole } from '@prisma/client';
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

describe('Platform provisioning (e2e)', () => {
  let app: INestApplication;
  let server: Server;
  let prisma: PrismaService;

  const suffix = `${Date.now()}`;
  const regularEmail = `plat.regular.${suffix}@example.com`;
  const regularPassword = 'Regular1!x';
  const platformEmail = `plat.vendor.${suffix}@example.com`;
  const platformPassword = 'Platfm1!x';
  const adminEmail = `plat.client.${suffix}@example.com`;
  const adminPassword = 'Client1!x';
  const organizationName = `Platform Org ${suffix}`;

  let regularCookies: string;
  let platformCookies: string;
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
      name: 'Regular User',
      email: regularEmail,
      password: regularPassword,
    });

    await insertUser(prisma, {
      name: 'Vendor Admin',
      email: platformEmail,
      password: platformPassword,
      platformRole: PlatformRole.PLATFORM_ADMIN,
    });

    const regularLogin = await request(server)
      .post('/auth/login')
      .send({ email: regularEmail, password: regularPassword })
      .expect(201);
    regularCookies = cookieHeader(regularLogin);

    const platformLogin = await request(server)
      .post('/auth/login')
      .send({ email: platformEmail, password: platformPassword })
      .expect(201);
    platformCookies = cookieHeader(platformLogin);
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /platform/organizations without cookie returns 401', async () => {
    await request(server)
      .post('/platform/organizations')
      .send({
        organizationName,
        farmName: 'Sede',
        admin: {
          name: 'Cliente Admin',
          email: adminEmail,
          password: adminPassword,
        },
      })
      .expect(401);
  });

  it('POST /platform/organizations as a regular user returns 403', async () => {
    await request(server)
      .post('/platform/organizations')
      .set('Cookie', regularCookies)
      .send({
        organizationName,
        farmName: 'Sede',
        admin: {
          name: 'Cliente Admin',
          email: adminEmail,
          password: adminPassword,
        },
      })
      .expect(403);
  });

  it('provisions the client admin without a vendor membership', async () => {
    const res = await request(server)
      .post('/platform/organizations')
      .set('Cookie', platformCookies)
      .send({
        organizationName,
        farmName: `Sede ${suffix}`,
        timezone: 'America/Bahia',
        admin: {
          name: 'Cliente Admin',
          email: adminEmail,
          password: adminPassword,
        },
      })
      .expect(201);

    const provisioned = commandResult<{
      organization: { id: string; name: string };
      farm: { id: string; organizationId: string; name: string };
      admin: {
        id: string;
        email: string;
        mustChangePassword: boolean;
        platformRole: string;
        password?: string;
      };
    }>(res);

    organizationId = provisioned.organization.id;
    farmId = provisioned.farm.id;
    adminUserId = provisioned.admin.id;

    expect(provisioned.organization.name).toBe(organizationName);
    expect(provisioned.farm.organizationId).toBe(organizationId);
    expect(provisioned.admin.email).toBe(adminEmail);
    expect(provisioned.admin.mustChangePassword).toBe(true);
    expect(provisioned.admin.platformRole).toBe('NONE');
    expect(provisioned.admin.password).toBeUndefined();

    const vendorMembership = await prisma.membership.findFirst({
      where: {
        organizationId,
        user: { email: platformEmail },
      },
    });
    expect(vendorMembership).toBeNull();

    const clientLogin = await request(server)
      .post('/auth/login')
      .send({ email: adminEmail, password: adminPassword })
      .expect(201);

    await request(server)
      .get('/farms')
      .set('Cookie', cookieHeader(clientLogin))
      .expect(403);

    const adminCookies = await changePassword(
      server,
      cookieHeader(clientLogin),
      adminPassword,
      'Client2!x',
    );

    const membershipsRes = await request(server)
      .get('/memberships')
      .query({ organizationId })
      .set('Cookie', adminCookies)
      .expect(200);

    const emails = listResults<{ user: { email: string } }>(membershipsRes).map(
      (item) => item.user.email,
    );
    expect(emails).toContain(adminEmail);
    expect(emails).not.toContain(platformEmail);

    const categoriesRes = await request(server)
      .get('/cost-categories')
      .set('Cookie', adminCookies)
      .set('x-farm-id', farmId)
      .query({ perPage: 50 })
      .expect(200);
    expect(listResults(categoriesRes)).toHaveLength(11);

    const listRes = await request(server)
      .get('/platform/organizations')
      .query({ name: organizationName })
      .set('Cookie', platformCookies)
      .expect(200);

    const listed = listResults<{
      id: string;
      farmCount: number;
      seasonCount: number;
      entryCount: number;
      lastAccessAt: string | null;
    }>(listRes);
    expect(listed).toHaveLength(1);
    expect(listed[0]?.id).toBe(organizationId);
    expect(listed[0]?.farmCount).toBe(1);
    expect(listed[0]?.seasonCount).toBe(0);
    expect(listed[0]?.entryCount).toBe(0);
    expect(listed[0]?.lastAccessAt).toEqual(expect.any(String));
  });

  it('GET /platform/organizations/:id/farms lists the provisioned farm', async () => {
    await request(server)
      .get(`/platform/organizations/${organizationId}/farms`)
      .expect(401);

    await request(server)
      .get(`/platform/organizations/${organizationId}/farms`)
      .set('Cookie', regularCookies)
      .expect(403);

    await request(server)
      .get(
        '/platform/organizations/00000000-0000-4000-8000-000000000099/farms',
      )
      .set('Cookie', platformCookies)
      .expect(404);

    const res = await request(server)
      .get(`/platform/organizations/${organizationId}/farms`)
      .query({ name: `Sede ${suffix}` })
      .set('Cookie', platformCookies)
      .expect(200);

    const farms = listResults<{
      id: string;
      organizationId: string;
      name: string;
    }>(res);
    expect(farms).toEqual([
      expect.objectContaining({
        id: farmId,
        organizationId,
        name: `Sede ${suffix}`,
      }),
    ]);
    expect(res.body).toEqual(
      expect.objectContaining({
        total: 1,
        page: 1,
        orderBy: 'name',
        orderDirection: 'asc',
      }),
    );
  });

  it('does not leave an organization when the admin email already exists', async () => {
    const orphanName = `Orphan Org ${suffix}`;

    await request(server)
      .post('/platform/organizations')
      .set('Cookie', platformCookies)
      .send({
        organizationName: orphanName,
        farmName: `Orphan Farm ${suffix}`,
        admin: {
          name: 'Cliente Admin',
          email: adminEmail,
          password: adminPassword,
        },
      })
      .expect(409);

    const orphan = await prisma.organization.findFirst({
      where: { name: orphanName },
    });
    expect(orphan).toBeNull();
  });

  it('GET /platform/users without cookie returns 401 and as a regular user returns 403', async () => {
    await request(server).get('/platform/users').expect(401);
    await request(server)
      .get('/platform/users')
      .set('Cookie', regularCookies)
      .expect(403);
  });

  it('creates a client user in the organization and resets the password', async () => {
    const operatorEmail = `plat.op.${suffix}@example.com`;
    const operatorPassword = 'Operat1!x';
    const resetPassword = 'Reset1!xx';

    const createRes = await request(server)
      .post('/platform/users')
      .set('Cookie', platformCookies)
      .send({
        organizationId,
        name: 'Operador Plataforma',
        email: operatorEmail,
        password: operatorPassword,
        role: 'USER',
      })
      .expect(201);

    const created = commandResult<{
      user: { id: string; mustChangePassword: boolean; email: string };
      memberships: Array<{ farmId: string | null; role: string }>;
    }>(createRes);

    expect(created.user.email).toBe(operatorEmail);
    expect(created.user.mustChangePassword).toBe(true);
    expect(created.memberships[0]?.farmId).toBeNull();
    expect(created.memberships[0]?.role).toBe('USER');

    const usersRes = await request(server)
      .get('/platform/users')
      .query({ organizationId, email: operatorEmail })
      .set('Cookie', platformCookies)
      .expect(200);
    expect(listResults<{ email: string }>(usersRes)).toEqual([
      expect.objectContaining({ email: operatorEmail }),
    ]);

    const operatorLogin = await request(server)
      .post('/auth/login')
      .send({ email: operatorEmail, password: operatorPassword })
      .expect(201);
    const operatorCookies = await changePassword(
      server,
      cookieHeader(operatorLogin),
      operatorPassword,
      'Operat2!x',
    );

    await request(server)
      .get('/auth/me')
      .set('Cookie', operatorCookies)
      .expect(200);

    await request(server)
      .post(`/platform/users/${created.user.id}/reset-password`)
      .set('Cookie', platformCookies)
      .send({ password: resetPassword })
      .expect(200);

    await request(server)
      .get('/auth/me')
      .set('Cookie', operatorCookies)
      .expect(401);

    await request(server)
      .post('/auth/login')
      .send({ email: operatorEmail, password: 'Operat2!x' })
      .expect(401);

    const resetLogin = await request(server)
      .post('/auth/login')
      .send({ email: operatorEmail, password: resetPassword })
      .expect(201);

    await request(server)
      .get('/farms')
      .set('Cookie', cookieHeader(resetLogin))
      .expect(403);

    await request(server)
      .post(
        '/platform/users/00000000-0000-4000-8000-000000000099/reset-password',
      )
      .set('Cookie', platformCookies)
      .send({ password: resetPassword })
      .expect(404);

    expect(adminUserId).toBeTruthy();
  });
});
