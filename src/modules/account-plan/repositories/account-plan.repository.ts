import { AccountPlan } from '@prisma/client';
import {
  CreateAccountPlanData,
  SearchManyQuery,
  UpdateAccountPlanData,
} from './@types';

export interface AccountPlanRepository {
  create(data: CreateAccountPlanData): Promise<AccountPlan>;
  update(data: UpdateAccountPlanData): Promise<AccountPlan>;
  delete(id: string): Promise<void>;
  findById(id: string): Promise<AccountPlan | null>;
  findByCode(code: string): Promise<AccountPlan | null>;
  searchMany(query: SearchManyQuery): Promise<AccountPlan[]>;
  count(query: SearchManyQuery): Promise<number>;
}

export const ACCOUNT_PLAN_REPOSITORY = 'ACCOUNT_PLAN_REPOSITORY';
