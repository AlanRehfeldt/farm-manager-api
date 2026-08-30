import {
  CropSeasonWithCrop,
  CropPlantingWithRelations,
} from '../repositories/@types';
import { decimalToString } from 'src/common/serialization/decimal';
import { bigintToNumber } from 'src/common/serialization/money';

export type CropSummary = {
  id: string;
  name: string;
};

export type CropSeasonResponse = {
  id: string;
  farmId: string;
  cropId: string;
  name: string;
  startDate: Date;
  endDate: Date | null;
  status: string;
  productionUomId: string;
  referenceSalePriceInCents: number | null;
  crop: CropSummary;
  createdAt: Date;
  updatedAt: Date;
};

export type CropPlantingResponse = {
  id: string;
  cropSeasonId: string;
  fieldId: string;
  varietyId: string | null;
  plantedAreaHa: string | null;
  field: {
    id: string;
    name: string;
    areaHa: string;
  };
  variety: {
    id: string;
    name: string;
  } | null;
  createdAt: Date;
  updatedAt: Date;
};

export function toCropSeasonResponse(
  cropSeason: CropSeasonWithCrop,
): CropSeasonResponse {
  return {
    id: cropSeason.id,
    farmId: cropSeason.farmId,
    cropId: cropSeason.cropId,
    name: cropSeason.name,
    startDate: cropSeason.startDate,
    endDate: cropSeason.endDate,
    status: cropSeason.status,
    productionUomId: cropSeason.productionUomId,
    referenceSalePriceInCents: bigintToNumber(
      cropSeason.referenceSalePriceInCents,
    ),
    crop: cropSeason.crop,
    createdAt: cropSeason.createdAt,
    updatedAt: cropSeason.updatedAt,
  };
}

export function toCropPlantingResponse(
  planting: CropPlantingWithRelations,
): CropPlantingResponse {
  return {
    id: planting.id,
    cropSeasonId: planting.cropSeasonId,
    fieldId: planting.fieldId,
    varietyId: planting.varietyId,
    plantedAreaHa: decimalToString(planting.plantedAreaHa),
    field: {
      id: planting.field.id,
      name: planting.field.name,
      areaHa: decimalToString(planting.field.areaHa)!,
    },
    variety: planting.variety
      ? { id: planting.variety.id, name: planting.variety.name }
      : null,
    createdAt: planting.createdAt,
    updatedAt: planting.updatedAt,
  };
}
