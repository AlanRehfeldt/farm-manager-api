import { CostCenter } from '@prisma/client';
import {
  CreateCostCenterData,
  SearchManyQuery,
  UpdateCostCenterData,
} from './@types';

export interface CostCenterRepository {
  create(data: CreateCostCenterData): Promise<CostCenter>;
  update(data: UpdateCostCenterData): Promise<CostCenter>;
  delete(id: string): Promise<void>;
  findById(id: string, organizationId: string): Promise<CostCenter | null>;
  findByCode(organizationId: string, code: string): Promise<CostCenter | null>;
  searchMany(query: SearchManyQuery): Promise<CostCenter[]>;
  count(query: SearchManyQuery): Promise<number>;
}

export const COST_CENTER_REPOSITORY = 'COST_CENTER_REPOSITORY';
