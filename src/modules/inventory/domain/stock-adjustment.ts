import { Decimal } from '@prisma/client/runtime/library';

/** Aplica ajuste com sinal; avgCost permanece inalterado (OQ-12). */
export function applyStockAdjustment(
  quantityOnHand: Decimal,
  signedQuantity: Decimal,
): Decimal {
  return quantityOnHand.add(signedQuantity);
}
