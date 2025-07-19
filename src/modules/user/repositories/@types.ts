import { Prisma, Role } from '@prisma/client';

export type CreateUserData = Prisma.UserUncheckedCreateInput;
export interface UpdateUserData {
  id: string;
  name?: string;
  email?: string;
  role?: Role;
  employeeId?: string;
}
export interface SearchManyQuery {
  id?: string;
  name?: string;
  email?: string;
  role?: Role;
  employeeId?: string;
  page: number;
  perPage: number;
  orderBy: string;
  orderDirection: 'asc' | 'desc';
}
