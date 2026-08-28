import { Farm } from '@prisma/client';
import { CreateFarmData, SearchManyQuery, UpdateFarmData } from './@types';

export interface FarmRepository {
  create(data: CreateFarmData): Promise<Farm>;
  update(data: UpdateFarmData): Promise<Farm>;
  findById(id: string): Promise<Farm | null>;
  findByOrganizationAndName(
    organizationId: string,
    name: string,
  ): Promise<Farm | null>;
  findAccessibleByUser(id: string, userId: string): Promise<Farm | null>;
  searchAccessibleByUser(
    userId: string,
    query: SearchManyQuery,
  ): Promise<Farm[]>;
  countAccessibleByUser(
    userId: string,
    query: SearchManyQuery,
  ): Promise<number>;
}

export const FARM_REPOSITORY = 'FARM_REPOSITORY';
