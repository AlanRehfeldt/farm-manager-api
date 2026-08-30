import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import { PlatformRole } from '@prisma/client';
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

function cookieHeader(res: request.Response): string {
  const setCookie = res.headers['set-cookie'];
  if (!setCookie) {
    throw new Error('Missing Set-Cookie header');
  }
  const cookies = Array.isArray(setCookie) ? setCookie : [setCookie];
  return cookies.map((cookie: string) => cookie.split(';')[0]).join('; ');
}

describe('Users platform admin (e2e)', () => {
  let app: INestApplication;
  let server: Server;
  let prisma: PrismaService;

  const suffix = `${Date.now()}`;
  const regularEmail = `regular.${suffix}@example.com`;
  const regularPassword = 'Regular1!x';
  const platformEmail = `platform.${suffix}@example.com`;
  const platformPassword = 'Platfm1!x';
  const newUserEmail = `new.user.${suffix}@example.com`;
  const newUserPassword = 'Newusr1!x';

  let regularCookies: string;
  let platformCookies: string;

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
      name: 'Platform Admin',
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

  it('POST /users without cookie returns 401', async () => {
    await request(server)
      .post('/users')
      .send({
        name: 'New User',
        email: newUserEmail,
        password: newUserPassword,
      })
      .expect(401);
  });

  it('POST /users as regular user returns 403', async () => {
    await request(server)
      .post('/users')
      .set('Cookie', regularCookies)
      .send({
        name: 'New User',
        email: newUserEmail,
        password: newUserPassword,
      })
      .expect(403);
  });

  it('POST /users as platform admin returns 201', async () => {
    const res = await request(server)
      .post('/users')
      .set('Cookie', platformCookies)
      .send({
        name: 'New User',
        email: newUserEmail,
        password: newUserPassword,
      })
      .expect(201);

    const body = res.body as ApiCommandResponse<{ email: string }>;
    expect(body.result.email).toBe(newUserEmail);
  });
});
