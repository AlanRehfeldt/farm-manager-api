import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PlatformRole, TransactionType } from '@prisma/client';
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

describe('Platform adoption (e2e)', () => {
  let app: INestApplication;
  let server: Server;
  let prisma: PrismaService;
  let platformCookies: string;
  let organizationId: string;
  let otherOrganizationId: string;
  let farmId: string;
  let adminUserId: string;
  let memberUserId: string;

  const suffix = `${Date.now()}`;
  const platformEmail = `adopt.vendor.${suffix}@example.com`;
  const platformPassword = 'Platfm1!x';
  const organizationName = `Adopt Org ${suffix}`;
  const otherOrganizationName = `Adopt Other ${suffix}`;

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
      name: 'Adoption Vendor',
      email: platformEmail,
      password: platformPassword,
      platformRole: PlatformRole.PLATFORM_ADMIN,
    });

    const login = await request(server)
      .post('/auth/login')
      .send({ email: platformEmail, password: platformPassword })
      .expect(201);
    platformCookies = cookieHeader(login);

    const created = await request(server)
      .post('/platform/organizations')
      .set('Cookie', platformCookies)
      .send({
        organizationName,
        farmName: `Sede ${suffix}`,
        timezone: 'America/Bahia',
        admin: {
          name: 'Cliente Adocao',
          email: `adopt.client.${suffix}@example.com`,
          password: 'Client1!x',
        },
      })
      .expect(201);

    const provisioned = commandResult<{
      organization: { id: string };
      farm: { id: string };
      admin: { id: string };
    }>(created);
    organizationId = provisioned.organization.id;
    farmId = provisioned.farm.id;
    adminUserId = provisioned.admin.id;

    const other = await request(server)
      .post('/platform/organizations')
      .set('Cookie', platformCookies)
      .send({
        organizationName: otherOrganizationName,
        farmName: `Outra ${suffix}`,
        admin: {
          name: 'Outro Cliente',
          email: `adopt.other.${suffix}@example.com`,
          password: 'Client1!x',
        },
      })
      .expect(201);
    otherOrganizationId = commandResult<{ organization: { id: string } }>(other)
      .organization.id;

    await prisma.transaction.create({
      data: { farmId, type: TransactionType.PURCHASE_INPUT },
    });
    await prisma.organization.update({
      where: { id: organizationId },
      data: { lastActivityAt: new Date() },
    });
  });

  afterAll(async () => {
    await app.close();
  });

  it('lists organizations from stored columns, without lifetime totals', async () => {
    const res = await request(server)
      .get('/platform/organizations')
      .query({ name: organizationName, usage: 'active30d' })
      .set('Cookie', platformCookies)
      .expect(200);

    const listed = (
      res.body as {
        results: Array<{
          id: string;
          seasonCount?: number;
          entryCount?: number;
          lastActivityAt: string | null;
        }>;
      }
    ).results;

    expect(listed).toHaveLength(1);
    expect(listed[0]?.id).toBe(organizationId);
    expect(listed[0]?.seasonCount).toBeUndefined();
    expect(listed[0]?.entryCount).toBeUndefined();
    expect(listed[0]?.lastActivityAt).toEqual(expect.any(String));

    const silent = await request(server)
      .get('/platform/organizations')
      .query({ name: organizationName, usage: 'silent30d' })
      .set('Cookie', platformCookies)
      .expect(200);

    expect((silent.body as { results: unknown[] }).results).toHaveLength(0);
  });

  it('returns a 30-day snapshot for one organization only', async () => {
    await request(server)
      .get('/platform/organizations/00000000-0000-4000-8000-000000000000')
      .set('Cookie', platformCookies)
      .expect(404);

    const res = await request(server)
      .get(`/platform/organizations/${organizationId}`)
      .set('Cookie', platformCookies)
      .expect(200);

    const detail = commandResult<{
      id: string;
      usage: { purchases: number; activities: number };
    }>(res);
    expect(detail.id).toBe(organizationId);
    expect(detail.usage.purchases).toBe(1);
    expect(detail.usage.activities).toBe(0);

    const other = await request(server)
      .get(`/platform/organizations/${otherOrganizationId}`)
      .set('Cookie', platformCookies)
      .expect(200);
    expect(
      commandResult<{ usage: { purchases: number } }>(other).usage.purchases,
    ).toBe(0);
  });

  it('updates the organization profile without changing status', async () => {
    const res = await request(server)
      .patch(`/platform/organizations/${organizationId}`)
      .set('Cookie', platformCookies)
      .send({ city: 'Juazeiro', state: 'BA' })
      .expect(200);

    expect(commandResult<{ city: string; status: string }>(res)).toMatchObject({
      city: 'Juazeiro',
      status: 'ACTIVE',
    });
  });

  it('removes a member, keeps the last admin, and ignores platform support', async () => {
    const created = await request(server)
      .post('/platform/users')
      .set('Cookie', platformCookies)
      .send({
        organizationId,
        name: 'Membro Adocao',
        email: `adopt.member.${suffix}@example.com`,
        password: 'Member1!x',
        role: 'USER',
        farmIds: [farmId],
      })
      .expect(201);
    memberUserId = commandResult<{ user: { id: string } }>(created).user.id;

    await request(server)
      .delete(`/platform/organizations/${organizationId}/users/${memberUserId}`)
      .set('Cookie', platformCookies)
      .expect(200);

    const membership = await prisma.membership.count({
      where: { userId: memberUserId, organizationId },
    });
    expect(membership).toBe(0);
    const user = await prisma.user.findUnique({ where: { id: memberUserId } });
    expect(user).not.toBeNull();

    await request(server)
      .delete(`/platform/organizations/${organizationId}/users/${adminUserId}`)
      .set('Cookie', platformCookies)
      .expect(409);

    const support = await insertUser(prisma, {
      name: 'Suporte Adocao',
      email: `adopt.support.${suffix}@example.com`,
      password: 'Supprt1!x',
      platformRole: PlatformRole.PLATFORM_SUPPORT,
    });

    await request(server)
      .delete(`/platform/organizations/${organizationId}/users/${support.id}`)
      .set('Cookie', platformCookies)
      .expect(404);
  });

  it('returns portfolio counts from columns and twelve week buckets', async () => {
    const res = await request(server)
      .get('/platform/adoption-summary')
      .set('Cookie', platformCookies)
      .expect(200);

    const summary = commandResult<{
      organizations: { active: number };
      usage: { active30d: number };
      activitiesByWeek: Array<{ weekStart: string; count: number }>;
    }>(res);

    expect(summary.organizations.active).toBeGreaterThanOrEqual(1);
    expect(summary.usage.active30d).toBeGreaterThanOrEqual(1);
    expect(summary.activitiesByWeek).toHaveLength(12);
    expect(summary.activitiesByWeek.every((week) => week.count >= 0)).toBe(
      true,
    );
  });
});
