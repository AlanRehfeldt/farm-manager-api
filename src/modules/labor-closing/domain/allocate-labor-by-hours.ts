import { Decimal } from '@prisma/client/runtime/client';

export type LaborHourLine = {
  activityLaborId: string;
  hours: Decimal;
};

export type LaborHourAllocation = {
  activityLaborId: string;
  amountInCents: bigint;
};

/**
 * Dilui salário mensal pelas horas apontadas (ADR-009 / PR-30).
 * Resíduo vai para a linha de maior horas; empate → menor activityLaborId.
 */
export function allocateLaborByHours(
  salaryInCents: bigint,
  lines: LaborHourLine[],
): LaborHourAllocation[] {
  if (lines.length === 0) {
    throw new Error('No labor lines to allocate');
  }

  const totalHours = lines.reduce(
    (sum, line) => sum.plus(line.hours),
    new Decimal(0),
  );

  if (totalHours.lte(0)) {
    throw new Error('Total hours must be positive');
  }

  const salaryDecimal = new Decimal(salaryInCents.toString());

  const residueLine = [...lines].sort((a, b) => {
    const hoursCmp = b.hours.comparedTo(a.hours);
    if (hoursCmp !== 0) {
      return hoursCmp;
    }
    return a.activityLaborId.localeCompare(b.activityLaborId);
  })[0];

  let allocated = 0n;
  const results: LaborHourAllocation[] = [];

  for (const line of lines) {
    if (line.activityLaborId === residueLine.activityLaborId) {
      continue;
    }

    const share = salaryDecimal
      .times(line.hours)
      .div(totalHours)
      .toDecimalPlaces(0, Decimal.ROUND_HALF_UP);

    const amount = BigInt(share.toFixed(0));
    allocated += amount;
    results.push({
      activityLaborId: line.activityLaborId,
      amountInCents: amount,
    });
  }

  results.push({
    activityLaborId: residueLine.activityLaborId,
    amountInCents: salaryInCents - allocated,
  });

  return results.sort((a, b) =>
    a.activityLaborId.localeCompare(b.activityLaborId),
  );
}
