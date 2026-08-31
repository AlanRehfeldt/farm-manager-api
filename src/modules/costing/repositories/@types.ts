import { CropSeasonStatus } from '@prisma/client';
import { SeasonCostingResult } from '../domain/compute-season-costing';

export type CropSeasonCostingContext = {
  id: string;
  farmId: string;
  status: CropSeasonStatus;
  productionUomId: string;
  productionUomAcronym: string;
  referenceSalePriceInCents: bigint | null;
};

export type CostEntryForCosting = {
  fieldId: string | null;
  sourceType: import('@prisma/client').CostEntrySourceType;
  costCategoryId: string;
  costCategoryCode: string;
  costCategoryName: string;
  amountInCents: bigint;
};

export type PlantingForCosting = {
  fieldId: string;
  fieldName: string;
  areaHa: import('@prisma/client/runtime/library').Decimal;
};

export type FieldHarvestForCosting = {
  fieldId: string;
  quantity: import('@prisma/client/runtime/library').Decimal;
};

export type SeasonCostingSnapshotRecord = {
  cropSeasonId: string;
  payload: SeasonCostingResult & {
    cropSeasonId: string;
    status: CropSeasonStatus;
    source: 'LIVE' | 'SNAPSHOT';
    closedAt: string | null;
    productionUomId: string;
    productionUomAcronym: string;
  };
  closedAt: Date;
  closedByUserId: string;
};

export type CloseSeasonData = {
  cropSeasonId: string;
  farmId: string;
  closedByUserId: string;
  payload: SeasonCostingSnapshotRecord['payload'];
};

export type UpdateReferencePriceData = {
  cropSeasonId: string;
  farmId: string;
  referenceSalePriceInCents: bigint | null;
};
