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

export type ActivityLaborResponse = {
  id: string;
  employeeId: string | null;
  employeeName: string | null;
  contractorName: string | null;
  payBasis: string;
  hours: string | null;
  days: string | null;
  outputQty: string | null;
  costInCents: number;
};

export type ActivityMachineHourResponse = {
  id: string;
  machineId: string;
  machineName: string;
  hours: string;
  hourlyCostSnapshot: number;
  costInCents: number;
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
  labor: ActivityLaborResponse[];
  machineHours: ActivityMachineHourResponse[];
  totalCostInCents: number;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateActivityResponse = ActivityResponse & {
  stockEffects: ActivityStockEffect[];
};

function findCostEntryAmount(
  activity: ActivityWithRelations,
  sourceType: CostEntrySourceType,
  sourceId: string,
): number {
  const entry = activity.costEntries.find(
    (ce) => ce.sourceType === sourceType && ce.sourceId === sourceId,
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
    amountInCents: findCostEntryAmount(
      activity,
      CostEntrySourceType.ACTIVITY_INPUT,
      input.id,
    ),
  }));

  const labor = activity.labor.map((line) => ({
    id: line.id,
    employeeId: line.employeeId,
    employeeName: line.employee?.name ?? null,
    contractorName: line.contractorName,
    payBasis: line.payBasis,
    hours: decimalToString(line.hours),
    days: decimalToString(line.days),
    outputQty: decimalToString(line.outputQty),
    costInCents: findCostEntryAmount(
      activity,
      CostEntrySourceType.ACTIVITY_LABOR,
      line.id,
    ),
  }));

  const machineHours = activity.machineHours.map((line) => ({
    id: line.id,
    machineId: line.machineId,
    machineName: line.machine.name,
    hours: decimalToString(line.hours)!,
    hourlyCostSnapshot: bigintToNumber(line.hourlyCostSnapshot)!,
    costInCents: findCostEntryAmount(
      activity,
      CostEntrySourceType.ACTIVITY_MACHINE,
      line.id,
    ),
  }));

  const totalCostInCents = activity.costEntries.reduce(
    (sum, entry) => sum + bigintToNumber(entry.amountInCents)!,
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
    labor,
    machineHours,
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
