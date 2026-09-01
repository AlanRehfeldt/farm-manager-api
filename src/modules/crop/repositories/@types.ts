import { Prisma } from '@prisma/client';

export type CreateCropData = Prisma.CropUncheckedCreateInput;

export interface UpdateCropData {
  id: string;
  name?: string;
  defaultProductionUomId?: string;
  externalRef?: string | null;
}

export interface SearchManyCropsQuery {
  id?: string;
  name?: string;
  organizationId: string;
  page: number;
  perPage: number;
  orderBy: string;
  orderDirection: 'asc' | 'desc';
}

export type CreateVarietyData = Prisma.VarietyUncheckedCreateInput;

export interface UpdateVarietyData {
  id: string;
  name?: string;
  externalRef?: string | null;
}

export interface SearchManyVarietiesQuery {
  id?: string;
  name?: string;
  cropId?: string;
  organizationId: string;
  page: number;
  perPage: number;
  orderBy: string;
  orderDirection: 'asc' | 'desc';
}
