import { Decimal } from '@prisma/client/runtime/library';

/** Valor da linha de consumo em centavos (half-up, ADR-009). */
export function computeConsumptionAmountInCents(
  quantity: string | Decimal,
  unitCostReais: Decimal,
): bigint {
  const qty = quantity instanceof Decimal ? quantity : new Decimal(quantity);
  const amountReais = qty.mul(unitCostReais);
  return BigInt(
    amountReais.toDecimalPlaces(2, Decimal.ROUND_HALF_UP).mul(100).toString(),
  );
}
