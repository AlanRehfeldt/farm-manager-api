import { Server } from 'node:http';
import request from 'supertest';

export async function changePassword(
  server: Server,
  cookies: string,
  currentPassword: string,
  newPassword: string,
): Promise<string> {
  const res = await request(server)
    .post('/auth/change-password')
    .set('Cookie', cookies)
    .send({ currentPassword, newPassword })
    .expect(201);

  const setCookie = res.headers['set-cookie'];
  if (!setCookie) {
    throw new Error('Missing Set-Cookie header after password change');
  }
  const cookieList = Array.isArray(setCookie) ? setCookie : [setCookie];
  return cookieList.map((cookie: string) => cookie.split(';')[0]).join('; ');
}
