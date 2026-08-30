import { CostCategory } from '@prisma/client';
import { SearchManyQuery } from './@types';

export interface CostCategoryRepository {
  upsertSeed(
    organizationId: string,
    code: string,
    name: string,
  ): Promise<CostCategory>;
  findByCode(
    organizationId: string,
    code: string,
  ): Promise<CostCategory | null>;
  searchMany(query: SearchManyQuery): Promise<CostCategory[]>;
  count(query: SearchManyQuery): Promise<number>;
}

export const COST_CATEGORY_REPOSITORY = 'COST_CATEGORY_REPOSITORY';
