/**
 * Auditoria fail-closed do suporte (PR-44).
 * O PR-46 completa este arquivo com concessão, revogação e o restante do acesso de suporte.
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
