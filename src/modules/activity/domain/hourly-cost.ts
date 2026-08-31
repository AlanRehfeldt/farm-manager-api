import { Decimal } from '@prisma/client/runtime/library';

/** hours × hourlyCostInCents → total cents (half-up). */
export function computeHourlyAmountInCents(
  hours: string | Decimal,
  hourlyCostInCents: bigint,
): bigint {
  const h = hours instanceof Decimal ? hours : new Decimal(hours);
  const amount = h.mul(new Decimal(hourlyCostInCents.toString()));
  return BigInt(amount.toDecimalPlaces(0, Decimal.ROUND_HALF_UP).toString());
}
