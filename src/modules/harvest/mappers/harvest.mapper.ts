import { Decimal } from '@prisma/client/runtime/library';
import { decimalToString } from 'src/common/serialization/decimal';
import { HarvestWithRelations } from '../repositories/@types';

export type HarvestItemResponse = {
  id: string;
  qualityClass: string;
  quantity: string;
  uomId: string;
  uomAcronym: string;
};

export type HarvestResponse = {
  id: string;
  farmId: string;
  cropSeasonId: string;
  cropSeasonName: string;
  fieldId: string;
  fieldName: string;
  date: Date;
  lotCode: string | null;
  note: string | null;
  items: HarvestItemResponse[];
  totalQuantity: string;
  createdAt: Date;
  updatedAt: Date;
};

export function toHarvestResponse(
  harvest: HarvestWithRelations,
): HarvestResponse {
  const items = harvest.items.map((item) => ({
    id: item.id,
    qualityClass: item.qualityClass,
    quantity: decimalToString(item.quantity)!,
    uomId: item.uomId,
    uomAcronym: item.uom.acronym,
  }));

  const totalQuantity = harvest.items
    .reduce((sum, item) => sum.plus(item.quantity), new Decimal(0))
    .toString();

  return {
    id: harvest.id,
    farmId: harvest.farmId,
    cropSeasonId: harvest.cropSeasonId,
    cropSeasonName: harvest.cropSeason.name,
    fieldId: harvest.fieldId,
    fieldName: harvest.field.name,
    date: harvest.date,
    lotCode: harvest.lotCode,
    note: harvest.note,
    items,
    totalQuantity,
    createdAt: harvest.createdAt,
    updatedAt: harvest.updatedAt,
  };
}
