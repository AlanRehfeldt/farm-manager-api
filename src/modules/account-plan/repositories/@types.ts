import { AccountPlan, Prisma } from '@prisma/client';

export type CreateAccountPlanData = Prisma.AccountPlanUncheckedCreateInput;

export interface UpdateAccountPlanData {
  id: string;
  name?: string;
  description?: string;
  code?: string;
  parentId?: string;
}

export type OrderableAccountPlanField =
  'id' | 'name' | 'description' | 'code' | 'createdAt' | 'updatedAt';

export interface SearchManyQuery {
  id?: string;
  name?: string;
  description?: string;
  code?: string;
  parentId?: string;
  page: number;
  perPage: number;
  orderBy: OrderableAccountPlanField;
  orderDirection: 'asc' | 'desc';
}

export type AccountPlanWithChildren = AccountPlan & {
  children: AccountPlanWithChildren[];
};
