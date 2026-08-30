import { CropSeason, CropSeasonStatus } from '@prisma/client';
import {
  CreateCropSeasonData,
  CropSeasonWithCrop,
  SearchManyCropSeasonsQuery,
  UpdateCropSeasonData,
} from './@types';

export interface CropSeasonRepository {
  create(data: CreateCropSeasonData): Promise<CropSeasonWithCrop>;
  update(data: UpdateCropSeasonData): Promise<CropSeasonWithCrop>;
  delete(id: string): Promise<void>;
  findById(id: string, farmId: string): Promise<CropSeasonWithCrop | null>;
  updateStatus(
    id: string,
    status: CropSeasonStatus,
  ): Promise<CropSeasonWithCrop>;
  countPlantings(cropSeasonId: string): Promise<number>;
  searchMany(query: SearchManyCropSeasonsQuery): Promise<CropSeasonWithCrop[]>;
  count(query: SearchManyCropSeasonsQuery): Promise<number>;
}

export const CROP_SEASON_REPOSITORY = 'CROP_SEASON_REPOSITORY';
