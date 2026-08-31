import { Decimal } from '@prisma/client/runtime/library';

export type FieldAreaInput = {
  fieldId: string;
  areaHa: Decimal;
};

export type AreaAllocation = {
  fieldId: string;
  amountInCents: bigint;
};

/**
 * Distribui valor proporcionalmente por área (ADR-009).
 * Resíduo vai para o talhão de maior área; empate → menor fieldId (estável).
 */
export function allocateByArea(
  totalInCents: bigint,
  fields: FieldAreaInput[],
): AreaAllocation[] {
  if (fields.length === 0) {
    throw new Error('No fields to allocate');
  }

  const totalArea = fields.reduce(
    (sum, field) => sum.plus(field.areaHa),
    new Decimal(0),
  );

  if (totalArea.lte(0)) {
    throw new Error('Total area must be positive');
  }

  const total = Number(totalInCents);

  const residueField = [...fields].sort((a, b) => {
    const areaCmp = b.areaHa.comparedTo(a.areaHa);
    if (areaCmp !== 0) {
      return areaCmp;
    }
    return a.fieldId.localeCompare(b.fieldId);
  })[0];

  let allocated = 0;
  const results: AreaAllocation[] = [];

  for (const field of fields) {
    if (field.fieldId === residueField.fieldId) {
      continue;
    }

    const share = new Decimal(total)
      .times(field.areaHa)
      .div(totalArea)
      .toDecimalPlaces(0, Decimal.ROUND_HALF_UP);

    const amount = Number(share);
    allocated += amount;
    results.push({
      fieldId: field.fieldId,
      amountInCents: BigInt(amount),
    });
  }

  results.push({
    fieldId: residueField.fieldId,
    amountInCents: BigInt(total - allocated),
  });

  return results.sort((a, b) => a.fieldId.localeCompare(b.fieldId));
}
