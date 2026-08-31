import {
  CropSeason,
  Field,
  Harvest,
  HarvestItem,
  HarvestQualityClass,
  UnitOfMeasurement,
} from '@prisma/client';

export type HarvestItemInput = {
  qualityClass: HarvestQualityClass;
  quantity: string;
  uomId?: string;
};

export type CreateHarvestItemData = {
  qualityClass: HarvestQualityClass;
  quantity: string;
  uomId: string;
};

export type CreateHarvestData = {
  farmId: string;
  cropSeasonId: string;
  fieldId: string;
  date: Date;
  lotCode?: string | null;
  note?: string | null;
  items: CreateHarvestItemData[];
};

export type HarvestItemWithUom = HarvestItem & {
  uom: Pick<UnitOfMeasurement, 'id' | 'name' | 'acronym'>;
};

export type HarvestWithRelations = Harvest & {
  cropSeason: Pick<CropSeason, 'id' | 'name' | 'status' | 'productionUomId'>;
  field: Pick<Field, 'id' | 'name' | 'areaHa'>;
  items: HarvestItemWithUom[];
};

export type CreateHarvestResult = {
  harvest: HarvestWithRelations;
};

export type SearchManyHarvestsQuery = {
  farmId: string;
  cropSeasonId: string;
  name?: string;
  page: number;
  perPage: number;
  orderBy: string;
  orderDirection: 'asc' | 'desc';
};

export type HarvestSeasonTotals = {
  harvestedQuantity: string;
  productionUomId: string;
};
