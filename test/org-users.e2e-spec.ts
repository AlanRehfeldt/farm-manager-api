import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import { PlatformRole, Role } from '@prisma/client';
import { Server } from 'node:http';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/common/prisma/prisma.service';
import {
  MEMBERSHIP_REPOSITORY,
  MembershipRepository,
} from '../src/modules/membership/repositories/membership.repository';
import { changePassword } from './helpers/change-password';
import { insertUser } from './helpers/insert-user';

type ApiCommandResponse<T> = {
  statusCode: number;
  message: string;
  result: T;
};

type ApiListResponse<T> = {
  results: T[];
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

describe('Org users (e2e)', () => {
  let app: INestApplication;
  let server: Server;
  let prisma: PrismaService;

  const suffix = `${Date.now()}`;
  const adminEmail = `orgusers.admin.${suffix}@example.com`;
  const adminPassword = 'Admin1!x';
  const operatorEmail = `orgusers.op.${suffix}@example.com`;
  const operatorPassword = 'Operat1!x';
  const operatorNextPassword = 'Operat2!x';
  const platformEmail = `orgusers.plat.${suffix}@example.com`;
  const platformPassword = 'Platfm1!x';

  let adminCookies: string;
  let organizationId: string;
  let farmAId: string;
  let farmBId: string;
  let farmCId: string;
  let operatorUserId: string;

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
      name: 'Org Users Admin',
      email: adminEmail,
      password: adminPassword,
    });

    const loginAdmin = await request(server)
      .post('/auth/login')
      .send({ email: adminEmail, password: adminPassword })
      .expect(201);
    adminCookies = cookieHeader(loginAdmin);

    const orgRes = await request(server)
      .post('/organizations')
      .set('Cookie', adminCookies)
      .send({ name: `Org Users ${suffix}` })
      .expect(201);
    organizationId = commandResult<{ id: string }>(orgRes).id;

    const farmA = await request(server)
      .post('/farms')
      .set('Cookie', adminCookies)
      .send({ organizationId, name: `A ${suffix}` })
      .expect(201);
    farmAId = commandResult<{ id: string }>(farmA).id;

    const farmB = await request(server)
      .post('/farms')
      .set('Cookie', adminCookies)
      .send({ organizationId, name: `B ${suffix}` })
      .expect(201);
    farmBId = commandResult<{ id: string }>(farmB).id;

    const farmC = await request(server)
      .post('/farms')
      .set('Cookie', adminCookies)
      .send({ organizationId, name: `C ${suffix}` })
      .expect(201);
    farmCId = commandResult<{ id: string }>(farmC).id;
  }, 60000);

  afterAll(async () => {
    await app.close();
  });

  it('rejects mixing farmId and farmIds', async () => {
    await request(server)
      .post('/memberships')
      .set('Cookie', adminCookies)
      .send({
        organizationId,
        farmId: farmAId,
        farmIds: [farmBId],
        role: 'USER',
        name: 'Mixed User Name',
        email: `mixed.${suffix}@example.com`,
        password: 'Mixed1!x',
      })
      .expect(400);
  });

  it('creates farm-scoped memberships for A and B and hides C', async () => {
    const createRes = await request(server)
      .post('/memberships')
      .set('Cookie', adminCookies)
      .send({
        organizationId,
        farmIds: [farmAId, farmBId],
        role: 'USER',
        name: 'Subset Operator',
        email: operatorEmail,
        password: operatorPassword,
      })
      .expect(201);

    operatorUserId = commandResult<{ userId: string }>(createRes).userId;

    const membershipsRes = await request(server)
      .get('/memberships')
      .query({ organizationId, userId: operatorUserId, perPage: 100 })
      .set('Cookie', adminCookies)
      .expect(200);

    const memberships = listResults<{ farmId: string | null }>(membershipsRes);
    expect(memberships).toHaveLength(2);
    expect(memberships.map((item) => item.farmId).sort()).toEqual(
      [farmAId, farmBId].sort(),
    );

    const loginOp = await request(server)
      .post('/auth/login')
      .send({ email: operatorEmail, password: operatorPassword })
      .expect(201);
    const opCookies = await changePassword(
      server,
      cookieHeader(loginOp),
      operatorPassword,
      operatorNextPassword,
    );

    const farmsRes = await request(server)
      .get('/farms')
      .set('Cookie', opCookies)
      .expect(200);

    const farmIds = listResults<{ id: string }>(farmsRes).map(
      (farm) => farm.id,
    );
    expect(farmIds).toHaveLength(2);
    expect(farmIds).toEqual(expect.arrayContaining([farmAId, farmBId]));
    expect(farmIds).not.toContain(farmCId);
  });

  it('updates name, email, role and farms', async () => {
    const updatedEmail = `subset.edit.${suffix}@example.com`;

    await request(server)
      .patch(`/memberships/users/${operatorUserId}`)
      .set('Cookie', adminCookies)
      .send({
        organizationId,
        name: 'Subset Edited',
        email: updatedEmail,
        role: 'USER',
        farmIds: [farmAId],
      })
      .expect(200);

    const membershipsRes = await request(server)
      .get('/memberships')
      .query({ organizationId, userId: operatorUserId, perPage: 100 })
      .set('Cookie', adminCookies)
      .expect(200);

    const memberships = listResults<{
      farmId: string | null;
      user: { name: string; email: string };
    }>(membershipsRes);

    expect(memberships).toHaveLength(1);
    expect(memberships[0]?.farmId).toBe(farmAId);
    expect(memberships[0]?.user.name).toBe('Subset Edited');
    expect(memberships[0]?.user.email).toBe(updatedEmail);
  });

  it('excludes platform admins from the org user list', async () => {
    const platformUser = await insertUser(prisma, {
      name: 'Hidden Platform',
      email: platformEmail,
      password: platformPassword,
      platformRole: PlatformRole.PLATFORM_ADMIN,
    });

    await prisma.membership.create({
      data: {
        userId: platformUser.id,
        organizationId,
        farmId: null,
        role: Role.ADMIN,
      },
    });

    const membershipsRes = await request(server)
      .get('/memberships')
      .query({ organizationId, perPage: 100 })
      .set('Cookie', adminCookies)
      .expect(200);

    const userIds = listResults<{ userId: string }>(membershipsRes).map(
      (item) => item.userId,
    );
    expect(userIds).not.toContain(platformUser.id);
  });

  it('rejects self-removal from the organization', async () => {
    const adminMe = await request(server)
      .get('/auth/me')
      .set('Cookie', adminCookies)
      .expect(200);
    const adminUserId = commandResult<{ id: string }>(adminMe).id;

    await request(server)
      .delete(`/memberships/users/${adminUserId}`)
      .query({ organizationId })
      .set('Cookie', adminCookies)
      .expect(403);
  });

  it('rejects demoting the last organization admin', async () => {
    const adminMe = await request(server)
      .get('/auth/me')
      .set('Cookie', adminCookies)
      .expect(200);
    const adminUserId = commandResult<{ id: string }>(adminMe).id;

    await request(server)
      .patch(`/memberships/users/${adminUserId}`)
      .set('Cookie', adminCookies)
      .send({
        organizationId,
        name: 'Org Users Admin',
        email: adminEmail,
        role: 'USER',
        farmIds: [farmAId],
      })
      .expect(409);
  });

  it('allows another admin to remove an admin while blocking self-removal', async () => {
    const secondAdminEmail = `orgusers.admin2.${suffix}@example.com`;
    const secondAdminPassword = 'Admin2!x';

    const createRes = await request(server)
      .post('/memberships')
      .set('Cookie', adminCookies)
      .send({
        organizationId,
        farmIds: [],
        role: 'ADMIN',
        name: 'Second Admin Name',
        email: secondAdminEmail,
        password: secondAdminPassword,
      })
      .expect(201);

    const secondAdminUserId = commandResult<{ userId: string }>(
      createRes,
    ).userId;

    const adminMe = await request(server)
      .get('/auth/me')
      .set('Cookie', adminCookies)
      .expect(200);
    const adminUserId = commandResult<{ id: string }>(adminMe).id;

    await request(server)
      .delete(`/memberships/users/${adminUserId}`)
      .query({ organizationId })
      .set('Cookie', adminCookies)
      .expect(403);

    await request(server)
      .delete(`/memberships/users/${secondAdminUserId}`)
      .query({ organizationId })
      .set('Cookie', adminCookies)
      .expect(200);

    const membershipsRes = await request(server)
      .get('/memberships')
      .query({ organizationId, userId: secondAdminUserId, perPage: 100 })
      .set('Cookie', adminCookies)
      .expect(200);

    expect(listResults(membershipsRes)).toHaveLength(0);
  });

  it('rolls back when createUserWithMemberships fails on invalid farm', async () => {
    const membershipRepository = app.get<MembershipRepository>(
      MEMBERSHIP_REPOSITORY,
    );
    const orphanEmail = `orphan.create.${suffix}@example.com`;
    const fakeFarmId = '00000000-0000-4000-8000-000000000001';

    await expect(
      membershipRepository.createUserWithMemberships(
        {
          name: 'Orphan Create User',
          email: orphanEmail,
          password: 'hashed-password',
          role: Role.USER,
          mustChangePassword: true,
        },
        [
          {
            organizationId,
            farmId: fakeFarmId,
            role: Role.USER,
          },
        ],
      ),
    ).rejects.toBeDefined();

    const orphan = await prisma.user.findUnique({
      where: { email: orphanEmail },
    });
    expect(orphan).toBeNull();
  });

  it('rolls back profile update when replaceProfileAndMemberships fails', async () => {
    const membershipRepository = app.get<MembershipRepository>(
      MEMBERSHIP_REPOSITORY,
    );
    const adminMe = await request(server)
      .get('/auth/me')
      .set('Cookie', adminCookies)
      .expect(200);
    const adminUserId = commandResult<{ id: string }>(adminMe).id;

    const before = await prisma.user.findUniqueOrThrow({
      where: { id: adminUserId },
    });

    const fakeFarmId = '00000000-0000-4000-8000-000000000002';

    await expect(
      membershipRepository.replaceProfileAndMemberships({
        userId: adminUserId,
        name: 'Should Not Persist',
        email: `rollback.${suffix}@example.com`,
        organizationId,
        memberships: [
          {
            userId: adminUserId,
            organizationId,
            farmId: fakeFarmId,
            role: Role.ADMIN,
          },
        ],
      }),
    ).rejects.toBeDefined();

    const after = await prisma.user.findUniqueOrThrow({
      where: { id: adminUserId },
    });
    expect(after.name).toBe(before.name);
    expect(after.email).toBe(before.email);

    const memberships = await prisma.membership.findMany({
      where: { userId: adminUserId, organizationId },
    });
    expect(memberships.some((item) => item.farmId === null)).toBe(true);
  });
});
