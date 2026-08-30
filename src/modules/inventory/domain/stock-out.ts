import { Decimal } from '@prisma/client/runtime/library';

/** Decrementa saldo; avgCost permanece inalterado (ADR-012). */
export function applyStockOut(
  quantityOnHand: Decimal,
  outQuantity: Decimal,
): Decimal {
  return quantityOnHand.sub(outQuantity);
}
