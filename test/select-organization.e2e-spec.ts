/**
 * Seleção de organização (PR-25, PR-45, PR-46).
 *
 * DoD do PR-25: o token da org A não autentica operação na org B
 * (`FORBIDDEN_ORGANIZATION`). Trocar de org exige reautenticação — o refresh
 * permanece na org já selecionada e `POST /auth/select-organization` com sessão
 * `BOUND` responde 403.
 *
 * `PLATFORM_ADMIN` sem membership segue `EXEMPT`; o refresh do vendor neste
 * arquivo não é revogado pela regra do PR-45. O suporte `EXEMPT` está em
 * `support-access.e2e-spec.ts`.
 */
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { OrganizationSelection, PlatformRole } from '@prisma/client';
import cookieParser from 'cookie-parser';
import { Server } from 'node:http';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/common/prisma/prisma.service';
import { FORBIDDEN_ORGANIZATION_CODE } from '../src/common/tenancy/forbidden-organization';
import { changePassword } from './helpers/change-password';
import { insertUser } from './helpers/insert-user';

type ApiCommandResponse<T> = {
  statusCode: number;
  message: string;
  result: T;
};

type MeSession = {
  organizationSelection: OrganizationSelection;
  organizationId: string | null;
  memberships: { organizationId: string }[];
  organizations: { id: string }[];
};

type ProvisionedOrg = {
  organizationId: string;
  farmId: string;
  adminCookies: string;
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

describe('Select organization (e2e)', () => {
  let app: INestApplication;
  let server: Server;
  let prisma: PrismaService;

  const suffix = `${Date.now()}-select`;
  const platformEmail = `select.vendor.${suffix}@example.com`;
  const platformPassword = 'Platfm1!x';
  const adminPassword = 'Client1!x';
  const adminNextPassword = 'Client2!x';

  let platformCookies: string;
  let orgA: ProvisionedOrg;
  let orgB: ProvisionedOrg;
  let orgC: ProvisionedOrg;
  let consultantUserId: string;
  let consultantCookies: string;

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

    orgA = await provisionOrg('A', `select.admin.a.${suffix}@example.com`);
    orgB = await provisionOrg('B', `select.admin.b.${suffix}@example.com`);
    orgC = await provisionOrg('C', `select.admin.c.${suffix}@example.com`);
  });

  afterAll(async () => {
    await app.close();
  });

  async function provisionOrg(
    label: string,
    adminEmail: string,
  ): Promise<ProvisionedOrg> {
    const provisioned = await request(server)
      .post('/platform/organizations')
      .set('Cookie', platformCookies)
      .send({
        organizationName: `Select Org ${label} ${suffix}`,
        farmName: `Sede ${label} ${suffix}`,
        timezone: 'America/Bahia',
        admin: {
          name: `Admin ${label}`,
          email: adminEmail,
          password: adminPassword,
        },
      })
      .expect(201);

    const created = commandResult<{
      organization: { id: string };
      farm: { id: string };
    }>(provisioned);

    const adminLogin = await request(server)
      .post('/auth/login')
      .send({ email: adminEmail, password: adminPassword })
      .expect(201);

    return {
      organizationId: created.organization.id,
      farmId: created.farm.id,
      adminCookies: await changePassword(
        server,
        cookieHeader(adminLogin),
        adminPassword,
        adminNextPassword,
      ),
    };
  }

  async function createTenant(
    email: string,
    password: string,
  ): Promise<string> {
    const res = await request(server)
      .post('/users')
      .set('Cookie', platformCookies)
      .send({
        name: 'Consultor Multi',
        email,
        password,
      })
      .expect(201);

    return commandResult<{ id: string }>(res).id;
  }

  async function attachAdmin(
    adminCookies: string,
    organizationId: string,
    userId: string,
  ) {
    await request(server)
      .post('/memberships')
      .set('Cookie', adminCookies)
      .send({ organizationId, userId, role: 'ADMIN' })
      .expect(201);
  }

  async function readMe(cookies: string): Promise<MeSession> {
    const res = await request(server)
      .get('/auth/me')
      .set('Cookie', cookies)
      .expect(200);

    return commandResult<MeSession>(res);
  }

  it('keeps the platform admin EXEMPT across refresh', async () => {
    const refreshed = await request(server)
      .post('/auth/refresh')
      .set('Cookie', platformCookies)
      .expect(201);
    platformCookies = cookieHeader(refreshed);

    const me = await readMe(platformCookies);
    expect(me.organizationSelection).toBe(OrganizationSelection.EXEMPT);
    expect(me.organizationId).toBeNull();
  });

  it('requires organization selection when the user belongs to two active organizations', async () => {
    const email = `select.consultant.${suffix}@example.com`;
    const password = 'Consult1!x';
    consultantUserId = await createTenant(email, password);
    await attachAdmin(orgA.adminCookies, orgA.organizationId, consultantUserId);
    await attachAdmin(orgB.adminCookies, orgB.organizationId, consultantUserId);

    const login = await request(server)
      .post('/auth/login')
      .send({ email, password })
      .expect(201);
    consultantCookies = await changePassword(
      server,
      cookieHeader(login),
      password,
      'Consult2!x',
    );

    const me = await readMe(consultantCookies);
    expect(me.organizationSelection).toBe(OrganizationSelection.PENDING);
    expect(
      me.organizations.map((organization) => organization.id).sort(),
    ).toEqual([orgA.organizationId, orgB.organizationId].sort());

    const farms = await request(server)
      .get('/farms')
      .set('Cookie', consultantCookies)
      .expect(403);
    expect((farms.body as { message: string }).message).toBe(
      'Organization selection required',
    );
  });

  it('rejects an organization the user does not belong to and a suspended one', async () => {
    const outsider = await provisionOrg(
      'Outsider',
      `select.outsider.${suffix}@example.com`,
    );

    const missing = await request(server)
      .post('/auth/select-organization')
      .set('Cookie', consultantCookies)
      .send({ organizationId: outsider.organizationId })
      .expect(403);
    expect((missing.body as { code: string }).code).toBe(
      FORBIDDEN_ORGANIZATION_CODE,
    );

    const suspendedOrg = await provisionOrg(
      'Suspended',
      `select.admin.suspended-pending.${suffix}@example.com`,
    );
    await attachAdmin(
      suspendedOrg.adminCookies,
      suspendedOrg.organizationId,
      consultantUserId,
    );

    await request(server)
      .patch(`/platform/organizations/${suspendedOrg.organizationId}/status`)
      .set('Cookie', platformCookies)
      .send({ status: 'SUSPENDED' })
      .expect(200);

    const suspended = await request(server)
      .post('/auth/select-organization')
      .set('Cookie', consultantCookies)
      .send({ organizationId: suspendedOrg.organizationId })
      .expect(403);
    expect((suspended.body as { code: string }).code).toBe(
      FORBIDDEN_ORGANIZATION_CODE,
    );
  });

  it('binds the session to organization A and rejects organization B', async () => {
    const selected = await request(server)
      .post('/auth/select-organization')
      .set('Cookie', consultantCookies)
      .send({ organizationId: orgA.organizationId })
      .expect(200);
    consultantCookies = cookieHeader(selected);

    const me = await readMe(consultantCookies);
    expect(me.organizationSelection).toBe(OrganizationSelection.BOUND);
    expect(me.organizationId).toBe(orgA.organizationId);
    expect(
      me.memberships.map((membership) => membership.organizationId),
    ).toEqual([orgA.organizationId]);

    const farms = await request(server)
      .get('/farms')
      .query({ organizationId: orgB.organizationId })
      .set('Cookie', consultantCookies)
      .expect(403);
    expect((farms.body as { code: string }).code).toBe(
      FORBIDDEN_ORGANIZATION_CODE,
    );

    const fields = await request(server)
      .get('/fields')
      .set('Cookie', consultantCookies)
      .set('x-farm-id', orgB.farmId)
      .expect(403);
    expect((fields.body as { code: string }).code).toBe(
      FORBIDDEN_ORGANIZATION_CODE,
    );
  });

  it('keeps the bound organization across refresh', async () => {
    const refreshed = await request(server)
      .post('/auth/refresh')
      .set('Cookie', consultantCookies)
      .expect(201);
    consultantCookies = cookieHeader(refreshed);

    const me = await readMe(consultantCookies);
    expect(me.organizationSelection).toBe(OrganizationSelection.BOUND);
    expect(me.organizationId).toBe(orgA.organizationId);
  });

  it('rejects selection when the session is already bound', async () => {
    const res = await request(server)
      .post('/auth/select-organization')
      .set('Cookie', consultantCookies)
      .send({ organizationId: orgA.organizationId })
      .expect(403);
    expect((res.body as { message: string }).message).toBe(
      'Organization selection is not pending',
    );
  });

  it('logs in already bound when the other organization is suspended', async () => {
    const email = `select.bound.${suffix}@example.com`;
    const password = 'Bound11!x';
    const userId = await createTenant(email, password);
    const suspended = await provisionOrg(
      'Dormant',
      `select.admin.dormant.${suffix}@example.com`,
    );
    await attachAdmin(orgA.adminCookies, orgA.organizationId, userId);
    await attachAdmin(suspended.adminCookies, suspended.organizationId, userId);

    await request(server)
      .patch(`/platform/organizations/${suspended.organizationId}/status`)
      .set('Cookie', platformCookies)
      .send({ status: 'SUSPENDED' })
      .expect(200);

    const login = await request(server)
      .post('/auth/login')
      .send({ email, password })
      .expect(201);

    const me = await readMe(cookieHeader(login));
    expect(me.organizationSelection).toBe(OrganizationSelection.BOUND);
    expect(me.organizationId).toBe(orgA.organizationId);
  });

  it('keeps the session pending until the password is changed', async () => {
    const email = `select.password.${suffix}@example.com`;
    const password = 'Passwd1!x';
    const userId = await createTenant(email, password);
    await attachAdmin(orgA.adminCookies, orgA.organizationId, userId);
    await attachAdmin(orgC.adminCookies, orgC.organizationId, userId);

    const login = await request(server)
      .post('/auth/login')
      .send({ email, password })
      .expect(201);
    const pendingCookies = cookieHeader(login);

    const blocked = await request(server)
      .post('/auth/select-organization')
      .set('Cookie', pendingCookies)
      .send({ organizationId: orgA.organizationId })
      .expect(403);
    expect((blocked.body as { message: string }).message).toBe(
      'Password change required',
    );

    const changed = await changePassword(
      server,
      pendingCookies,
      password,
      'Passwd2!x',
    );
    const me = await readMe(changed);
    expect(me.organizationSelection).toBe(OrganizationSelection.PENDING);
    expect(me.organizationId).toBeNull();
  });

  it('drops an exempt tenant session after the first memberships', async () => {
    const email = `select.exempt.${suffix}@example.com`;
    const password = 'Exempt1!x';
    const nextPassword = 'Exempt2!x';
    const userId = await createTenant(email, password);

    const login = await request(server)
      .post('/auth/login')
      .send({ email, password })
      .expect(201);
    const exemptCookies = await changePassword(
      server,
      cookieHeader(login),
      password,
      nextPassword,
    );

    const before = await readMe(exemptCookies);
    expect(before.organizationSelection).toBe(OrganizationSelection.EXEMPT);
    expect(before.memberships).toEqual([]);

    await attachAdmin(orgA.adminCookies, orgA.organizationId, userId);
    await attachAdmin(orgC.adminCookies, orgC.organizationId, userId);

    await request(server)
      .get('/auth/me')
      .set('Cookie', exemptCookies)
      .expect(401);

    await request(server)
      .post('/auth/refresh')
      .set('Cookie', exemptCookies)
      .expect(401);

    const relogin = await request(server)
      .post('/auth/login')
      .send({ email, password: nextPassword })
      .expect(201);
    const pendingCookies = cookieHeader(relogin);

    const me = await readMe(pendingCookies);
    expect(me.organizationSelection).toBe(OrganizationSelection.PENDING);

    const farms = await request(server)
      .get('/farms')
      .set('Cookie', pendingCookies)
      .expect(403);
    expect((farms.body as { message: string }).message).toBe(
      'Organization selection required',
    );
  });
});
