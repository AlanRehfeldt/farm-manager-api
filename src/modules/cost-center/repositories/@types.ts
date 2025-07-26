import { CostCenter, Prisma } from '@prisma/client';

export type CreateCostCenterData = Prisma.CostCenterUncheckedCreateInput;

export interface UpdateCostCenterData {
  id: string;
  name?: string;
  description?: string;
  code?: string;
  parentId?: string;
}

export type OrderableCostCenterField =
  | 'id'
  | 'name'
  | 'description'
  | 'code'
  | 'createdAt'
  | 'updatedAt';

export interface SearchManyQuery {
  id?: string;
  name?: string;
  description?: string;
  code?: string;
  parentId?: string;
  page: number;
  perPage: number;
  orderBy: OrderableCostCenterField;
  orderDirection: 'asc' | 'desc';
}

export type CostCenterWithChildren = CostCenter & {
  children: CostCenterWithChildren[];
};
