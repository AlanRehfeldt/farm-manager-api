import { CropSeason, CropSeasonStatus, Prisma } from '@prisma/client';

export type CropSeasonWithCrop = CropSeason & {
  crop: { id: string; name: string };
};

export type CreateCropSeasonData = Prisma.CropSeasonUncheckedCreateInput;

export interface UpdateCropSeasonData {
  id: string;
  name?: string;
  startDate?: Date;
  endDate?: Date | null;
  productionUomId?: string;
  referenceSalePriceInCents?: bigint | null;
}

export interface SearchManyCropSeasonsQuery {
  id?: string;
  name?: string;
  status?: CropSeasonStatus;
  cropId?: string;
  farmId: string;
  page: number;
  perPage: number;
  orderBy: string;
  orderDirection: 'asc' | 'desc';
}

export type CreateCropPlantingData = Prisma.CropPlantingUncheckedCreateInput;

export interface UpdateCropPlantingData {
  id: string;
  varietyId?: string | null;
  plantedAreaHa?: Prisma.Decimal | null;
}

export interface SearchManyCropPlantingsQuery {
  id?: string;
  cropSeasonId?: string;
  fieldId?: string;
  farmId: string;
  page: number;
  perPage: number;
  orderBy: string;
  orderDirection: 'asc' | 'desc';
}

export type CropPlantingWithRelations = Prisma.CropPlantingGetPayload<{
  include: {
    field: true;
    variety: true;
  };
}>;
