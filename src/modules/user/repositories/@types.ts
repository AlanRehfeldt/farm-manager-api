import { Prisma, Role } from '@prisma/client';

export type CreateUserData = Prisma.UserUncheckedCreateInput;
export type UpdateUserData = Prisma.UserUncheckedUpdateInput;
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
