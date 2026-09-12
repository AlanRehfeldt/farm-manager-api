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

function cookieHeader(res: request.Response): string {
  const setCookie = res.headers['set-cookie'];
  if (!setCookie) {
    throw new Error('Missing Set-Cookie header');
  }
  const cookies = Array.isArray(setCookie) ? setCookie : [setCookie];
  return cookies.map((cookie: string) => cookie.split(';')[0]).join('; ');
}

describe('Password change (e2e)', () => {
  let app: INestApplication;
  let server: Server;
  let prisma: PrismaService;
  let platformCookies: string;

  const suffix = `${Date.now()}`;
  const platformEmail = `pw.platform.${suffix}@example.com`;
  const platformPassword = 'Platfm1!x';
  const newUserEmail = `pw.user.${suffix}@example.com`;
  const tempPassword = 'TempPass1!';
  const nextPassword = 'NextPass1!';

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
      name: 'Platform Admin',
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

  it('forces password change after POST /users before business routes', async () => {
    const createRes = await request(server)
      .post('/users')
      .set('Cookie', platformCookies)
      .send({
        name: 'Temp Password User',
        email: newUserEmail,
        password: tempPassword,
      })
      .expect(201);

    const created = createRes.body as ApiCommandResponse<{
      mustChangePassword: boolean;
    }>;
    expect(created.result.mustChangePassword).toBe(true);

    const loginRes = await request(server)
      .post('/auth/login')
      .send({ email: newUserEmail, password: tempPassword })
      .expect(201);
    let cookies = cookieHeader(loginRes);

    const meRes = await request(server)
      .get('/auth/me')
      .set('Cookie', cookies)
      .expect(200);

    const me = (
      meRes.body as ApiCommandResponse<{ mustChangePassword: boolean }>
    ).result;
    expect(me.mustChangePassword).toBe(true);

    await request(server).get('/farms').set('Cookie', cookies).expect(403);

    await request(server)
      .post('/auth/change-password')
      .set('Cookie', cookies)
      .send({
        currentPassword: 'WrongPass1!',
        newPassword: nextPassword,
      })
      .expect(401);

    cookies = await changePassword(server, cookies, tempPassword, nextPassword);

    const meAfter = await request(server)
      .get('/auth/me')
      .set('Cookie', cookies)
      .expect(200);

    expect(
      (meAfter.body as ApiCommandResponse<{ mustChangePassword: boolean }>)
        .result.mustChangePassword,
    ).toBe(false);

    await request(server).get('/farms').set('Cookie', cookies).expect(200);
  });
});
