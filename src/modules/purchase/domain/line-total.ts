import { Decimal } from '@prisma/client/runtime/library';

/** Total da linha em centavos inteiros (half-up). */
export function computeLineTotalInCents(
  quantity: string | Decimal,
  priceInCents: number,
): bigint {
  const qty = quantity instanceof Decimal ? quantity : new Decimal(quantity);
  const lineTotal = qty.mul(priceInCents);
  return BigInt(lineTotal.toDecimalPlaces(0, Decimal.ROUND_HALF_UP).toString());
}

export function sumLineTotalsInCents(
  items: Array<{ quantity: string; priceInCents: number }>,
): bigint {
  return items.reduce(
    (sum, item) =>
      sum + computeLineTotalInCents(item.quantity, item.priceInCents),
    0n,
  );
}
