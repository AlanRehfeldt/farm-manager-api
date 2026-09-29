import { PlatformRole, PrismaClient } from '@prisma/client';
import { Server } from 'node:http';
import request from 'supertest';
import { changePassword } from './change-password';
import { insertUser } from './insert-user';

const TEMP_ADMIN_PASSWORD = 'Temp1!xx';
const PLATFORM_PASSWORD = 'Platfm1!x';

type ApiCommandResponse<T> = {
  statusCode: number;
  message: string;
  result: T;
};

type ProvisionResult = {
  organization: { id: string };
  farm: { id: string };
  admin: { id: string };
};

function cookieHeader(res: request.Response): string {
  const setCookie = res.headers['set-cookie'];
  if (!setCookie) {
    throw new Error('Missing Set-Cookie header');
  }
  const cookies = Array.isArray(setCookie) ? setCookie : [setCookie];
  return cookies.map((cookie: string) => cookie.split(';')[0]).join('; ');
}

export async function provisionOrganization(
  server: Server,
  prisma: PrismaClient,
  input: {
    organizationName: string;
    farmName: string;
    adminName: string;
    adminEmail: string;
    adminPassword: string;
    timezone?: string;
  },
) {
  const platformEmail = `platform.${input.adminEmail}`;

  await insertUser(prisma, {
    name: 'Platform Admin',
    email: platformEmail,
    password: PLATFORM_PASSWORD,
    platformRole: PlatformRole.PLATFORM_ADMIN,
  });

  const platformLogin = await request(server)
    .post('/auth/login')
    .send({ email: platformEmail, password: PLATFORM_PASSWORD })
    .expect(201);

  const provisionRes = await request(server)
    .post('/platform/organizations')
    .set('Cookie', cookieHeader(platformLogin))
    .send({
      organizationName: input.organizationName,
      farmName: input.farmName,
      timezone: input.timezone,
      admin: {
        name: input.adminName,
        email: input.adminEmail,
        password: TEMP_ADMIN_PASSWORD,
      },
    })
    .expect(201);

  const provisioned = (provisionRes.body as ApiCommandResponse<ProvisionResult>)
    .result;

  const clientLogin = await request(server)
    .post('/auth/login')
    .send({ email: input.adminEmail, password: TEMP_ADMIN_PASSWORD })
    .expect(201);

  const adminCookies = await changePassword(
    server,
    cookieHeader(clientLogin),
    TEMP_ADMIN_PASSWORD,
    input.adminPassword,
  );

  return {
    organizationId: provisioned.organization.id,
    farmId: provisioned.farm.id,
    adminUserId: provisioned.admin.id,
    adminCookies,
  };
}
