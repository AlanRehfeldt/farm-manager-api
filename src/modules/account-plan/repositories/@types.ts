import { AccountType, Prisma } from '@prisma/client';

export type CreateAccountPlanData = Prisma.AccountPlanUncheckedCreateInput;

export interface UpdateAccountPlanData {
  id: string;
  name?: string;
  code?: string;
  type?: AccountType;
}

export interface SearchManyQuery {
  id?: string;
  name?: string;
  code?: string;
  type?: AccountType;
  page: number;
  perPage: number;
  orderBy: string;
  orderDirection: 'asc' | 'desc';
}
