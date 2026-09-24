import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
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

type SupplierResult = {
  id: string;
  name: string;
  cnpj: string | null;
  cpf: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  phoneNumber: string | null;
};

/**
 * PR-27 / PR-37 / PR-40: fornecedor com CPF e CNPJ, troca de documento e limpeza de opcionais.
 */
describe('Suppliers (e2e)', () => {
  let app: INestApplication;
  let server: Server;

  const suffix = `${Date.now()}`;
  const adminEmail = `sup.admin.${suffix}@example.com`;
  const adminPassword = 'Admin1!x';

  const validCnpj = '11222333000181';
  const validCpf = '52998224725';
  /** CPF distinto para a troca de documento (evita 409 com o create por CPF). */
  const swapCpf = '39053344705';
  const otherCnpj = '34028316000103';

  let adminCookies: string;
  let farmId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());
    await app.init();
    server = app.getHttpServer() as Server;

    await insertUser(app.get(PrismaService), {
      name: 'Supplier Admin',
      email: adminEmail,
      password: adminPassword,
    });

    const loginRes = await request(server)
      .post('/auth/login')
      .send({ email: adminEmail, password: adminPassword })
      .expect(201);
    adminCookies = cookieHeader(loginRes);

    const onboardingRes = await request(server)
      .post('/onboarding')
      .set('Cookie', adminCookies)
      .send({
        organizationName: `Supplier Org ${suffix}`,
        farmName: `Sede Sup ${suffix}`,
      })
      .expect(201);

    farmId = commandResult<{ farm: { id: string } }>(onboardingRes).farm.id;
  });

  afterAll(async () => {
    await app.close();
  });

  it('creates suppliers with CNPJ and with CPF', async () => {
    const cnpjRes = await request(server)
      .post('/suppliers')
      .set('Cookie', adminCookies)
      .set('x-farm-id', farmId)
      .send({
        name: 'Fornecedor CNPJ SA',
        cnpj: validCnpj,
        address: 'Rua A, 100',
        city: 'Juazeiro',
        state: 'BA',
        phoneNumber: '74999887766',
      })
      .expect(201);

    const withCnpj = commandResult<SupplierResult>(cnpjRes);
    expect(withCnpj.cnpj).toBe(validCnpj);
    expect(withCnpj.cpf).toBeNull();
    expect(withCnpj.city).toBe('Juazeiro');
    expect(withCnpj.state).toBe('BA');
    expect(withCnpj.phoneNumber).toBe('74999887766');

    const cpfRes = await request(server)
      .post('/suppliers')
      .set('Cookie', adminCookies)
      .set('x-farm-id', farmId)
      .send({
        name: 'Fornecedor CPF ME',
        cpf: validCpf,
      })
      .expect(201);

    const withCpf = commandResult<SupplierResult>(cpfRes);
    expect(withCpf.cpf).toBe(validCpf);
    expect(withCpf.cnpj).toBeNull();
  });

  it('switches document from CNPJ to CPF and clears optional fields', async () => {
    const createRes = await request(server)
      .post('/suppliers')
      .set('Cookie', adminCookies)
      .set('x-farm-id', farmId)
      .send({
        name: 'Troca Documento LTDA',
        cnpj: otherCnpj,
        address: 'Av Central 50',
        city: 'Petrolina',
        state: 'PE',
        phoneNumber: '8733445566',
      })
      .expect(201);

    const created = commandResult<SupplierResult>(createRes);
    expect(created.cnpj).toBe(otherCnpj);

    const swapRes = await request(server)
      .put(`/suppliers/${created.id}`)
      .set('Cookie', adminCookies)
      .set('x-farm-id', farmId)
      .send({
        cnpj: null,
        cpf: swapCpf,
      })
      .expect(200);

    const swapped = commandResult<SupplierResult>(swapRes);
    expect(swapped.cpf).toBe(swapCpf);
    expect(swapped.cnpj).toBeNull();

    const clearRes = await request(server)
      .put(`/suppliers/${created.id}`)
      .set('Cookie', adminCookies)
      .set('x-farm-id', farmId)
      .send({
        address: null,
        city: null,
        state: null,
        phoneNumber: null,
      })
      .expect(200);

    const cleared = commandResult<SupplierResult>(clearRes);
    expect(cleared.address).toBeNull();
    expect(cleared.city).toBeNull();
    expect(cleared.state).toBeNull();
    expect(cleared.phoneNumber).toBeNull();
    expect(cleared.cpf).toBe(swapCpf);
  });
});
