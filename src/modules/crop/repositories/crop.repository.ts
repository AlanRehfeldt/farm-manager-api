import { Crop } from '@prisma/client';
import { CreateCropData, SearchManyCropsQuery, UpdateCropData } from './@types';

export interface CropRepository {
  create(data: CreateCropData): Promise<Crop>;
  update(data: UpdateCropData): Promise<Crop>;
  delete(id: string): Promise<void>;
  findById(id: string, organizationId: string): Promise<Crop | null>;
  findByName(organizationId: string, name: string): Promise<Crop | null>;
  searchMany(query: SearchManyCropsQuery): Promise<Crop[]>;
  count(query: SearchManyCropsQuery): Promise<number>;
}

export const CROP_REPOSITORY = 'CROP_REPOSITORY';
