import { CostEntrySourceType } from '@prisma/client';
import { decimalToString } from 'src/common/serialization/decimal';
import { bigintToNumber } from 'src/common/serialization/money';
import {
  ActivityStockEffect,
  ActivityWithRelations,
} from '../repositories/@types';

export type ActivityInputResponse = {
  id: string;
  productId: string;
  productName: string;
  uomAcronym: string;
  quantity: string;
  unitCostSnapshot: string;
  amountInCents: number;
};

export type ActivityResponse = {
  id: string;
  farmId: string;
  cropSeasonId: string;
  cropSeasonName: string;
  cropName: string;
  fieldId: string;
  fieldName: string;
  activityType: string;
  date: Date;
  note: string | null;
  inputs: ActivityInputResponse[];
  totalCostInCents: number;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateActivityResponse = ActivityResponse & {
  stockEffects: ActivityStockEffect[];
};

function findInputCostEntry(
  activity: ActivityWithRelations,
  inputId: string,
): number {
  const entry = activity.costEntries.find(
    (ce) =>
      ce.sourceType === CostEntrySourceType.ACTIVITY_INPUT &&
      ce.sourceId === inputId,
  );

  return entry ? bigintToNumber(entry.amountInCents)! : 0;
}

export function toActivityResponse(
  activity: ActivityWithRelations,
): ActivityResponse {
  const inputs = activity.inputs.map((input) => ({
    id: input.id,
    productId: input.productId,
    productName: input.product.name,
    uomAcronym: input.product.unitOfMeasurement.acronym,
    quantity: decimalToString(input.quantity)!,
    unitCostSnapshot: decimalToString(input.unitCostSnapshot)!,
    amountInCents: findInputCostEntry(activity, input.id),
  }));

  const totalCostInCents = inputs.reduce(
    (sum, input) => sum + input.amountInCents,
    0,
  );

  return {
    id: activity.id,
    farmId: activity.farmId,
    cropSeasonId: activity.cropSeasonId,
    cropSeasonName: activity.cropSeason.name,
    cropName: activity.cropSeason.crop.name,
    fieldId: activity.fieldId,
    fieldName: activity.field.name,
    activityType: activity.activityType,
    date: activity.date,
    note: activity.note,
    inputs,
    totalCostInCents,
    createdAt: activity.createdAt,
    updatedAt: activity.updatedAt,
  };
}

export function toCreateActivityResponse(
  activity: ActivityWithRelations,
  stockEffects: ActivityStockEffect[],
): CreateActivityResponse {
  return {
    ...toActivityResponse(activity),
    stockEffects,
  };
}
