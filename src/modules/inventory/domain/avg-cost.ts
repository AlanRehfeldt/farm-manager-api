import { Decimal } from '@prisma/client/runtime/library';

export function computeNewAvgCost(
  quantityOnHand: Decimal,
  avgCost: Decimal,
  purchaseQuantity: Decimal,
  unitPriceInReais: Decimal,
): { quantityOnHand: Decimal; avgCost: Decimal } {
  const newQuantityOnHand = quantityOnHand.add(purchaseQuantity);

  if (quantityOnHand.isZero()) {
    return {
      quantityOnHand: newQuantityOnHand,
      avgCost: unitPriceInReais,
    };
  }

  const totalValue = quantityOnHand
    .mul(avgCost)
    .add(purchaseQuantity.mul(unitPriceInReais));
  const newAvgCost = totalValue.div(newQuantityOnHand);

  return {
    quantityOnHand: newQuantityOnHand,
    avgCost: newAvgCost,
  };
}
