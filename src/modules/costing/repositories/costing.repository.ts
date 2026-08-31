import {
  CloseSeasonData,
  CostEntryForCosting,
  CropSeasonCostingContext,
  FieldHarvestForCosting,
  PlantingForCosting,
  SeasonCostingSnapshotRecord,
  UpdateReferencePriceData,
} from './@types';

export interface CostingRepository {
  findSeasonContext(
    cropSeasonId: string,
    farmId: string,
  ): Promise<CropSeasonCostingContext | null>;

  findCostEntries(cropSeasonId: string): Promise<CostEntryForCosting[]>;

  findPlantings(cropSeasonId: string): Promise<PlantingForCosting[]>;

  findFieldHarvests(
    farmId: string,
    cropSeasonId: string,
    productionUomId: string,
  ): Promise<FieldHarvestForCosting[]>;

  findSnapshot(
    cropSeasonId: string,
  ): Promise<SeasonCostingSnapshotRecord | null>;

  closeSeason(data: CloseSeasonData): Promise<void>;

  updateReferencePrice(data: UpdateReferencePriceData): Promise<void>;
}

export const COSTING_REPOSITORY = 'COSTING_REPOSITORY';
