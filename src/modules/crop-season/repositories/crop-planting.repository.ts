import {
  CreateCropPlantingData,
  CropPlantingWithRelations,
  SearchManyCropPlantingsQuery,
  UpdateCropPlantingData,
} from './@types';

export interface CropPlantingRepository {
  create(data: CreateCropPlantingData): Promise<CropPlantingWithRelations>;
  update(data: UpdateCropPlantingData): Promise<CropPlantingWithRelations>;
  delete(id: string): Promise<void>;
  findById(
    id: string,
    farmId: string,
  ): Promise<CropPlantingWithRelations | null>;
  findBySeasonAndField(
    cropSeasonId: string,
    fieldId: string,
  ): Promise<CropPlantingWithRelations | null>;
  countBySeasonId(cropSeasonId: string): Promise<number>;
  searchMany(
    query: SearchManyCropPlantingsQuery,
  ): Promise<CropPlantingWithRelations[]>;
  count(query: SearchManyCropPlantingsQuery): Promise<number>;
}

export const CROP_PLANTING_REPOSITORY = 'CROP_PLANTING_REPOSITORY';
