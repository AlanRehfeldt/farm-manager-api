/**
 * Acesso de suporte (PR-21, PR-44, PR-46).
 *
 * DoD do PR-21 coberto aqui: concessão e revogação geram auditoria; suporte sem
 * concessão não lista fazenda e `POST /onboarding` responde 403; revogação vale
 * no request seguinte, sem refresh; escrita farm-scoped e `POST /memberships`
 * gravam `TENANT_WRITE` com o id do suporte e a organização.
 *
 * Fora deste e2e: a tela que não manda o suporte sem concessão para `/onboarding`
 * (sem Playwright). Atividade, fechamento de safra e fechamento de mão de obra
 * gravam `createdByUserId` / `closedByUserId` de quem operou — já no código, não
 * reabrir neste diff.
 */
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PlatformRole } from '@prisma/client';
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

type AuditLogRow = {
  actorUserId: string;
  action: string;
  targetType: string;
  organizationId: string | null;
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

describe('Support write audit (e2e)', () => {
  let app: INestApplication;
  let server: Server;
  let prisma: PrismaService;

  const suffix = `${Date.now()}`;
  const platformEmail = `audit.vendor.${suffix}@example.com`;
  const platformPassword = 'Platfm1!x';
  const supportEmail = `audit.support.${suffix}@example.com`;
  const supportPassword = 'Supprt1!x';
  const supportNextPassword = 'Supprt2!x';
  const supportFinalPassword = 'Supprt3!x';
  const adminEmail = `audit.client.${suffix}@example.com`;
  const adminPassword = 'Client1!x';
  const operatorEmail = `audit.operator.${suffix}@example.com`;

  let platformCookies: string;
  let supportCookies: string;
  let supportUserId: string;
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

    const provisioned = await request(server)
      .post('/platform/organizations')
      .set('Cookie', platformCookies)
      .send({
        organizationName: `Audit Org ${suffix}`,
        farmName: `Sede ${suffix}`,
        timezone: 'America/Bahia',
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
    }>(provisioned);
    organizationId = created.organization.id;
    farmId = created.farm.id;

    const supportUser = await request(server)
      .post('/platform/support-users')
      .set('Cookie', platformCookies)
      .send({
        name: 'Suporte Auditoria',
        email: supportEmail,
        password: supportPassword,
      })
      .expect(201);
    supportUserId = commandResult<{ id: string }>(supportUser).id;

    const supportLogin = await request(server)
      .post('/auth/login')
      .send({ email: supportEmail, password: supportPassword })
      .expect(201);
    supportCookies = await changePassword(
      server,
      cookieHeader(supportLogin),
      supportPassword,
      supportNextPassword,
    );

    await request(server)
      .post('/platform/support-access')
      .set('Cookie', platformCookies)
      .send({ userId: supportUserId, organizationId })
      .expect(201);
  });

  afterAll(async () => {
    await app.close();
  });

  async function tenantWrites(): Promise<AuditLogRow[]> {
    const res = await request(server)
      .get('/platform/audit-logs')
      .query({
        organizationId,
        action: 'TENANT_WRITE',
        actorUserId: supportUserId,
        perPage: 50,
      })
      .set('Cookie', platformCookies)
      .expect(200);

    return listResults<AuditLogRow>(res);
  }

  it('records a farm-scoped support write with the organization', async () => {
    await request(server)
      .post('/fields')
      .set('Cookie', supportCookies)
      .set('x-farm-id', farmId)
      .send({ name: `Talhao ${suffix}`, areaHa: '1.5' })
      .expect(201);

    const writes = await tenantWrites();
    const fieldWrite = writes.find((row) => row.targetType.includes('/fields'));

    expect(fieldWrite?.actorUserId).toBe(supportUserId);
    expect(fieldWrite?.action).toBe('TENANT_WRITE');
    expect(fieldWrite?.organizationId).toBe(organizationId);
  });

  it('records a membership write without x-farm-id', async () => {
    await request(server)
      .post('/memberships')
      .set('Cookie', supportCookies)
      .send({
        organizationId,
        name: 'Operador Audit',
        email: operatorEmail,
        password: 'Operad1!x',
        role: 'USER',
      })
      .expect(201);

    const writes = await tenantWrites();
    const membershipWrite = writes.find((row) =>
      row.targetType.includes('/memberships'),
    );

    expect(membershipWrite?.actorUserId).toBe(supportUserId);
    expect(membershipWrite?.action).toBe('TENANT_WRITE');
    expect(membershipWrite?.organizationId).toBe(organizationId);
  });

  it('does not record TENANT_WRITE for a support password change', async () => {
    supportCookies = await changePassword(
      server,
      supportCookies,
      supportNextPassword,
      supportFinalPassword,
    );

    const authWrites = await prisma.platformAuditLog.count({
      where: {
        actorUserId: supportUserId,
        action: 'TENANT_WRITE',
        targetType: { contains: '/auth/' },
      },
    });

    expect(authWrites).toBe(0);
  });
});

describe('Support access (e2e)', () => {
  let app: INestApplication;
  let server: Server;
  let prisma: PrismaService;

  const suffix = `${Date.now()}-access`;
  const platformEmail = `access.vendor.${suffix}@example.com`;
  const platformPassword = 'Platfm1!x';
  const regularEmail = `access.regular.${suffix}@example.com`;
  const regularPassword = 'Regular1!x';
  const supportEmail = `access.support.${suffix}@example.com`;
  const supportPassword = 'Supprt1!x';
  const supportNextPassword = 'Supprt2!x';
  const adminEmail = `access.client.${suffix}@example.com`;
  const adminPassword = 'Client1!x';
  const adminNextPassword = 'Client2!x';
  const createdSupportEmail = `access.created.${suffix}@example.com`;
  const ungrantedEmail = `access.none.${suffix}@example.com`;
  const ungrantedPassword = 'Supprt1!x';
  const ungrantedNextPassword = 'Supprt2!x';

  let platformUserId: string;
  let platformCookies: string;
  let regularCookies: string;
  let adminCookies: string;
  let adminUserId: string;
  let supportUserId: string;
  let supportCookies: string;
  let organizationId: string;
  let farmId: string;
  let suspendedOrganizationId: string;
  let supportAccessId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());
    await app.init();
    server = app.getHttpServer() as Server;
    prisma = app.get(PrismaService);

    const platformUser = await insertUser(prisma, {
      name: 'Vendor Admin',
      email: platformEmail,
      password: platformPassword,
      platformRole: PlatformRole.PLATFORM_ADMIN,
    });
    platformUserId = platformUser.id;

    await insertUser(prisma, {
      name: 'Regular User',
      email: regularEmail,
      password: regularPassword,
    });

    const platformLogin = await request(server)
      .post('/auth/login')
      .send({ email: platformEmail, password: platformPassword })
      .expect(201);
    platformCookies = cookieHeader(platformLogin);

    const regularLogin = await request(server)
      .post('/auth/login')
      .send({ email: regularEmail, password: regularPassword })
      .expect(201);
    regularCookies = cookieHeader(regularLogin);

    const provisioned = await request(server)
      .post('/platform/organizations')
      .set('Cookie', platformCookies)
      .send({
        organizationName: `Access Org ${suffix}`,
        farmName: `Sede ${suffix}`,
        timezone: 'America/Bahia',
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

    const adminLogin = await request(server)
      .post('/auth/login')
      .send({ email: adminEmail, password: adminPassword })
      .expect(201);
    adminCookies = await changePassword(
      server,
      cookieHeader(adminLogin),
      adminPassword,
      adminNextPassword,
    );

    const suspended = await request(server)
      .post('/platform/organizations')
      .set('Cookie', platformCookies)
      .send({
        organizationName: `Suspended Access ${suffix}`,
        farmName: `Sede suspensa ${suffix}`,
        timezone: 'America/Bahia',
        admin: {
          name: 'Admin Suspenso',
          email: `access.suspended.${suffix}@example.com`,
          password: adminPassword,
        },
      })
      .expect(201);
    suspendedOrganizationId = commandResult<{
      organization: { id: string };
    }>(suspended).organization.id;

    await request(server)
      .patch(`/platform/organizations/${suspendedOrganizationId}/status`)
      .set('Cookie', platformCookies)
      .send({ status: 'SUSPENDED' })
      .expect(200);

    const supportUser = await request(server)
      .post('/platform/support-users')
      .set('Cookie', platformCookies)
      .send({
        name: 'Suporte Acesso',
        email: supportEmail,
        password: supportPassword,
      })
      .expect(201);
    supportUserId = commandResult<{ id: string }>(supportUser).id;

    const supportLogin = await request(server)
      .post('/auth/login')
      .send({ email: supportEmail, password: supportPassword })
      .expect(201);
    supportCookies = await changePassword(
      server,
      cookieHeader(supportLogin),
      supportPassword,
      supportNextPassword,
    );
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /platform/support-users without cookie returns 401', async () => {
    await request(server)
      .post('/platform/support-users')
      .send({
        name: 'Suporte Sem Cookie',
        email: `access.nocookie.${suffix}@example.com`,
        password: supportPassword,
      })
      .expect(401);
  });

  it('POST /platform/support-users as a regular user returns 403', async () => {
    await request(server)
      .post('/platform/support-users')
      .set('Cookie', regularCookies)
      .send({
        name: 'Suporte Regular',
        email: `access.denied.${suffix}@example.com`,
        password: supportPassword,
      })
      .expect(403);
  });

  it('POST /platform/support-users persists PLATFORM_SUPPORT without a membership', async () => {
    const res = await request(server)
      .post('/platform/support-users')
      .set('Cookie', platformCookies)
      .send({
        name: 'Suporte Criado',
        email: createdSupportEmail,
        password: supportPassword,
      })
      .expect(201);

    const created = commandResult<{
      id: string;
      mustChangePassword: boolean;
    }>(res);
    expect(created.mustChangePassword).toBe(true);

    const user = await prisma.user.findUnique({ where: { id: created.id } });
    expect(user?.platformRole).toBe(PlatformRole.PLATFORM_SUPPORT);

    const memberships = await prisma.membership.count({
      where: { userId: created.id },
    });
    expect(memberships).toBe(0);
  });

  it('rejects platform routes for an authenticated support user', async () => {
    await request(server)
      .post('/platform/organizations')
      .set('Cookie', supportCookies)
      .send({
        organizationName: `Bloqueada ${suffix}`,
        farmName: 'Sede',
        admin: {
          name: 'Admin Bloqueado',
          email: `access.blocked.${suffix}@example.com`,
          password: adminPassword,
        },
      })
      .expect(403);

    await request(server)
      .patch(`/platform/organizations/${organizationId}/status`)
      .set('Cookie', supportCookies)
      .send({ status: 'SUSPENDED' })
      .expect(403);

    await request(server)
      .post('/platform/support-access')
      .set('Cookie', supportCookies)
      .send({ userId: supportUserId, organizationId })
      .expect(403);

    await request(server)
      .post('/users')
      .set('Cookie', supportCookies)
      .send({
        name: 'Usuario Bloqueado',
        email: `access.user.${suffix}@example.com`,
        password: 'User11!x',
      })
      .expect(403);
  });

  it('grants support access on an active organization and audits it', async () => {
    const res = await request(server)
      .post('/platform/support-access')
      .set('Cookie', platformCookies)
      .send({ userId: supportUserId, organizationId })
      .expect(201);

    supportAccessId = commandResult<{ id: string }>(res).id;

    const logs = await request(server)
      .get('/platform/audit-logs')
      .query({
        organizationId,
        action: 'SUPPORT_ACCESS_GRANTED',
        perPage: 50,
      })
      .set('Cookie', platformCookies)
      .expect(200);

    const granted = listResults<AuditLogRow>(logs).find(
      (row) => row.targetType === 'SupportAccess',
    );
    expect(granted?.actorUserId).toBe(platformUserId);
    expect(granted?.action).toBe('SUPPORT_ACCESS_GRANTED');
    expect(granted?.organizationId).toBe(organizationId);
  });

  it('returns 409 when the same support access is granted again', async () => {
    await request(server)
      .post('/platform/support-access')
      .set('Cookie', platformCookies)
      .send({ userId: supportUserId, organizationId })
      .expect(409);
  });

  it('returns 403 when granting access to a user who is not support', async () => {
    await request(server)
      .post('/platform/support-access')
      .set('Cookie', platformCookies)
      .send({ userId: adminUserId, organizationId })
      .expect(403);
  });

  it('returns 403 when granting access to a suspended organization', async () => {
    await request(server)
      .post('/platform/support-access')
      .set('Cookie', platformCookies)
      .send({
        userId: supportUserId,
        organizationId: suspendedOrganizationId,
      })
      .expect(403);
  });

  it('lists the granted farm without a membership and stays EXEMPT', async () => {
    const me = await request(server)
      .get('/auth/me')
      .set('Cookie', supportCookies)
      .expect(200);

    const session = commandResult<{
      organizationSelection: string;
      supportAccesses: { organizationId: string }[];
      memberships: { organizationId: string }[];
    }>(me);
    expect(session.organizationSelection).toBe('EXEMPT');
    expect(session.memberships).toEqual([]);
    expect(session.supportAccesses).toEqual(
      expect.arrayContaining([expect.objectContaining({ organizationId })]),
    );

    const farms = await request(server)
      .get('/farms')
      .query({ organizationId })
      .set('Cookie', supportCookies)
      .expect(200);
    expect(listResults<{ id: string }>(farms).map((farm) => farm.id)).toContain(
      farmId,
    );

    await request(server)
      .get('/fields')
      .set('Cookie', supportCookies)
      .set('x-farm-id', farmId)
      .expect(200);

    const memberships = await prisma.membership.count({
      where: { userId: supportUserId },
    });
    expect(memberships).toBe(0);
  });

  it('hides the support user from the organization membership list', async () => {
    const res = await request(server)
      .get('/memberships')
      .query({ organizationId, perPage: 50 })
      .set('Cookie', adminCookies)
      .expect(200);

    const rows = listResults<{ userId: string; user?: { email: string } }>(res);
    expect(rows.some((row) => row.user?.email === adminEmail)).toBe(true);
    expect(
      rows.some(
        (row) =>
          row.userId === supportUserId || row.user?.email === supportEmail,
      ),
    ).toBe(false);
  });

  it('revokes support access on the next request without a refresh', async () => {
    await request(server)
      .delete(`/platform/support-access/${supportAccessId}`)
      .set('Cookie', platformCookies)
      .expect(200);

    await request(server)
      .get('/fields')
      .set('Cookie', supportCookies)
      .set('x-farm-id', farmId)
      .expect(403);

    const logs = await request(server)
      .get('/platform/audit-logs')
      .query({
        organizationId,
        action: 'SUPPORT_ACCESS_REVOKED',
        perPage: 50,
      })
      .set('Cookie', platformCookies)
      .expect(200);

    const revoked = listResults<AuditLogRow>(logs).find(
      (row) => row.targetType === 'SupportAccess',
    );
    expect(revoked?.action).toBe('SUPPORT_ACCESS_REVOKED');
    expect(revoked?.organizationId).toBe(organizationId);
  });

  it('returns an empty farm list and forbids onboarding without a grant', async () => {
    const created = await request(server)
      .post('/platform/support-users')
      .set('Cookie', platformCookies)
      .send({
        name: 'Suporte Sem Acesso',
        email: ungrantedEmail,
        password: ungrantedPassword,
      })
      .expect(201);
    const ungrantedUserId = commandResult<{ id: string }>(created).id;

    const login = await request(server)
      .post('/auth/login')
      .send({ email: ungrantedEmail, password: ungrantedPassword })
      .expect(201);
    const ungrantedCookies = await changePassword(
      server,
      cookieHeader(login),
      ungrantedPassword,
      ungrantedNextPassword,
    );

    const farms = await request(server)
      .get('/farms')
      .set('Cookie', ungrantedCookies)
      .expect(200);
    expect((farms.body as ApiListResponse<unknown>).total).toBe(0);

    const onboarding = await request(server)
      .post('/onboarding')
      .set('Cookie', ungrantedCookies)
      .send({ farmName: `Sede ${suffix}`, timezone: 'America/Bahia' })
      .expect(403);
    expect((onboarding.body as { message: string }).message).toBe(
      'Platform users cannot create a farm through onboarding',
    );

    const memberships = await prisma.membership.count({
      where: { userId: ungrantedUserId },
    });
    expect(memberships).toBe(0);
  });
});
