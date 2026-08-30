import { Variety } from '@prisma/client';
import {
  CreateVarietyData,
  SearchManyVarietiesQuery,
  UpdateVarietyData,
} from './@types';

export interface VarietyRepository {
  create(data: CreateVarietyData): Promise<Variety>;
  update(data: UpdateVarietyData): Promise<Variety>;
  delete(id: string): Promise<void>;
  findById(id: string, organizationId: string): Promise<Variety | null>;
  findByName(cropId: string, name: string): Promise<Variety | null>;
  searchMany(query: SearchManyVarietiesQuery): Promise<Variety[]>;
  count(query: SearchManyVarietiesQuery): Promise<number>;
}

export const VARIETY_REPOSITORY = 'VARIETY_REPOSITORY';
