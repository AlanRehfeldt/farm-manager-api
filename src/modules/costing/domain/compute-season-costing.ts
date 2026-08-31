import { CostEntrySourceType } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

export type CostEntryInput = {
  fieldId: string | null;
  sourceType: CostEntrySourceType;
  costCategoryId: string;
  costCategoryCode: string;
  costCategoryName: string;
  amountInCents: bigint;
};

export type PlantingAreaInput = {
  fieldId: string;
  fieldName: string;
  areaHa: Decimal;
};

export type FieldHarvestInput = {
  fieldId: string;
  quantity: Decimal;
};

export type ComputeSeasonCostingInput = {
  costEntries: CostEntryInput[];
  plantings: PlantingAreaInput[];
  fieldHarvests: FieldHarvestInput[];
  referenceSalePriceInCents: bigint | null;
};

export type CategoryBreakdown = {
  costCategoryId: string;
  code: string;
  name: string;
  amountInCents: number;
};

export type SourceBreakdown = {
  sourceType: CostEntrySourceType;
  amountInCents: number;
};

export type FieldCosting = {
  fieldId: string;
  fieldName: string;
  areaHa: string;
  harvestedQuantity: string;
  totalCostInCents: number;
  costPerHaInCents: number | null;
  costPerUnitInCents: number | null;
};

export type SeasonCostingResult = {
  totalCostInCents: number;
  areaHa: string;
  harvestedQuantity: string;
  costPerHaInCents: number | null;
  costPerUnitInCents: number | null;
  referenceSalePriceInCents: number | null;
  estimatedMarginPerUnitInCents: number | null;
  breakdownByCategory: CategoryBreakdown[];
  breakdownBySource: SourceBreakdown[];
  byField: FieldCosting[];
};

function bigintToNumber(value: bigint): number {
  return Number(value);
}

function divideCentsHalfUp(
  totalInCents: bigint,
  divisor: Decimal,
): number | null {
  if (divisor.lte(0)) {
    return null;
  }

  const quotient = new Decimal(totalInCents.toString()).div(divisor);
  return quotient.toDecimalPlaces(0, Decimal.ROUND_HALF_UP).toNumber();
}

function sumEntries(entries: CostEntryInput[]): bigint {
  return entries.reduce((sum, entry) => sum + entry.amountInCents, 0n);
}

function sumHarvestQuantity(harvests: FieldHarvestInput[]): Decimal {
  return harvests.reduce(
    (sum, harvest) => sum.plus(harvest.quantity),
    new Decimal(0),
  );
}

function sumArea(plantings: PlantingAreaInput[]): Decimal {
  return plantings.reduce(
    (sum, planting) => sum.plus(planting.areaHa),
    new Decimal(0),
  );
}

function buildCategoryBreakdown(
  entries: CostEntryInput[],
): CategoryBreakdown[] {
  const byCategory = new Map<string, CategoryBreakdown>();

  for (const entry of entries) {
    const existing = byCategory.get(entry.costCategoryId);
    if (existing) {
      existing.amountInCents += bigintToNumber(entry.amountInCents);
    } else {
      byCategory.set(entry.costCategoryId, {
        costCategoryId: entry.costCategoryId,
        code: entry.costCategoryCode,
        name: entry.costCategoryName,
        amountInCents: bigintToNumber(entry.amountInCents),
      });
    }
  }

  return [...byCategory.values()].sort((a, b) =>
    a.name.localeCompare(b.name, 'pt-BR'),
  );
}

function buildSourceBreakdown(entries: CostEntryInput[]): SourceBreakdown[] {
  const bySource = new Map<CostEntrySourceType, number>();

  for (const entry of entries) {
    const current = bySource.get(entry.sourceType) ?? 0;
    bySource.set(
      entry.sourceType,
      current + bigintToNumber(entry.amountInCents),
    );
  }

  return [...bySource.entries()]
    .map(([sourceType, amountInCents]) => ({ sourceType, amountInCents }))
    .sort((a, b) => a.sourceType.localeCompare(b.sourceType));
}

function buildByField(
  entries: CostEntryInput[],
  plantings: PlantingAreaInput[],
  fieldHarvests: FieldHarvestInput[],
): FieldCosting[] {
  const plantingByField = new Map(
    plantings.map((planting) => [planting.fieldId, planting]),
  );

  const harvestByField = new Map<string, Decimal>();
  for (const harvest of fieldHarvests) {
    const current = harvestByField.get(harvest.fieldId) ?? new Decimal(0);
    harvestByField.set(harvest.fieldId, current.plus(harvest.quantity));
  }

  const fieldIds = new Set([
    ...plantings.map((p) => p.fieldId),
    ...fieldHarvests.map((h) => h.fieldId),
    ...entries.map((e) => e.fieldId).filter((id): id is string => id != null),
  ]);

  const result: FieldCosting[] = [];

  for (const fieldId of [...fieldIds].sort()) {
    const planting = plantingByField.get(fieldId);
    const fieldEntries = entries.filter((e) => e.fieldId === fieldId);
    const totalCost = sumEntries(fieldEntries);
    const areaHa = planting?.areaHa ?? new Decimal(0);
    const harvestedQuantity = harvestByField.get(fieldId) ?? new Decimal(0);

    const costPerHaInCents = areaHa.gt(0)
      ? divideCentsHalfUp(totalCost, areaHa)
      : null;
    const costPerUnitInCents = harvestedQuantity.gt(0)
      ? divideCentsHalfUp(totalCost, harvestedQuantity)
      : null;

    result.push({
      fieldId,
      fieldName: planting?.fieldName ?? fieldId,
      areaHa: areaHa.toString(),
      harvestedQuantity: harvestedQuantity.toString(),
      totalCostInCents: bigintToNumber(totalCost),
      costPerHaInCents,
      costPerUnitInCents,
    });
  }

  return result;
}

export function computeSeasonCosting(
  input: ComputeSeasonCostingInput,
): SeasonCostingResult {
  const totalCost = sumEntries(input.costEntries);
  const totalArea = sumArea(input.plantings);
  const totalHarvested = sumHarvestQuantity(input.fieldHarvests);

  const costPerHaInCents = totalArea.gt(0)
    ? divideCentsHalfUp(totalCost, totalArea)
    : null;
  const costPerUnitInCents = totalHarvested.gt(0)
    ? divideCentsHalfUp(totalCost, totalHarvested)
    : null;

  const referenceSalePriceInCents =
    input.referenceSalePriceInCents != null
      ? bigintToNumber(input.referenceSalePriceInCents)
      : null;

  const estimatedMarginPerUnitInCents =
    referenceSalePriceInCents != null && costPerUnitInCents != null
      ? referenceSalePriceInCents - costPerUnitInCents
      : null;

  return {
    totalCostInCents: bigintToNumber(totalCost),
    areaHa: totalArea.toString(),
    harvestedQuantity: totalHarvested.toString(),
    costPerHaInCents,
    costPerUnitInCents,
    referenceSalePriceInCents,
    estimatedMarginPerUnitInCents,
    breakdownByCategory: buildCategoryBreakdown(input.costEntries),
    breakdownBySource: buildSourceBreakdown(input.costEntries),
    byField: buildByField(
      input.costEntries,
      input.plantings,
      input.fieldHarvests,
    ),
  };
}
