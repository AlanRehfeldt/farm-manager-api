import {
  CreateHarvestData,
  CreateHarvestResult,
  HarvestSeasonTotals,
  HarvestWithRelations,
  SearchManyHarvestsQuery,
} from './@types';

export interface HarvestRepository {
  create(data: CreateHarvestData): Promise<CreateHarvestResult>;
  findById(id: string, farmId: string): Promise<HarvestWithRelations | null>;
  searchMany(query: SearchManyHarvestsQuery): Promise<HarvestWithRelations[]>;
  count(query: SearchManyHarvestsQuery): Promise<number>;
  sumSeasonQuantity(
    farmId: string,
    cropSeasonId: string,
    productionUomId: string,
  ): Promise<HarvestSeasonTotals>;
}

export const HARVEST_REPOSITORY = 'HARVEST_REPOSITORY';
