import { hash } from 'bcryptjs';

export const BCRYPT_ROUNDS = 10;

export function hashPassword(password: string): Promise<string> {
  return hash(password, BCRYPT_ROUNDS);
}
