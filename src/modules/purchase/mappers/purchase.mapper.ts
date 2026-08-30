import { decimalToString } from 'src/common/serialization/decimal';
import { bigintToNumber } from 'src/common/serialization/money';
import { computeLineTotalInCents } from '../domain/line-total';
import { PurchaseWithRelations, StockEffect } from '../repositories/@types';

export type PurchaseItemResponse = {
  id: string;
  productId: string;
  productName: string;
  uomAcronym: string;
  quantity: string;
  priceInCents: number;
};

export type PurchaseInstallmentResponse = {
  id: string;
  valueInCents: number;
  dueDate: Date;
  paymentDate: Date | null;
  paymentForm: string;
};

export type PurchaseResponse = {
  id: string;
  transactionId: string;
  farmId: string;
  date: Date;
  documentRef: string | null;
  note: string | null;
  supplier: {
    id: string;
    name: string;
  };
  items: PurchaseItemResponse[];
  installments: PurchaseInstallmentResponse[];
  totalInCents: number;
  createdAt: Date;
  updatedAt: Date;
};

export type CreatePurchaseResponse = PurchaseResponse & {
  stockEffects: StockEffect[];
};

export function toPurchaseResponse(
  purchase: PurchaseWithRelations,
): PurchaseResponse {
  const items = purchase.purchaseTransactionProducts.map((item) => ({
    id: item.id,
    productId: item.productId,
    productName: item.product.name,
    uomAcronym: item.product.unitOfMeasurement.acronym,
    quantity: decimalToString(item.quantity)!,
    priceInCents: bigintToNumber(item.priceInCents)!,
  }));

  const installments = purchase.transaction.installments.map((inst) => ({
    id: inst.id,
    valueInCents: bigintToNumber(inst.valueInCents)!,
    dueDate: inst.dueDate,
    paymentDate: inst.paymentDate,
    paymentForm: inst.paymentForm,
  }));

  const totalInCents = purchase.purchaseTransactionProducts.reduce(
    (sum, item) =>
      sum +
      Number(
        computeLineTotalInCents(
          item.quantity,
          bigintToNumber(item.priceInCents)!,
        ),
      ),
    0,
  );

  return {
    id: purchase.id,
    transactionId: purchase.transactionId,
    farmId: purchase.transaction.farmId,
    date: purchase.transaction.date,
    documentRef: purchase.documentRef,
    note: purchase.transaction.note,
    supplier: {
      id: purchase.supplier.id,
      name: purchase.supplier.name,
    },
    items,
    installments,
    totalInCents,
    createdAt: purchase.createdAt,
    updatedAt: purchase.updatedAt,
  };
}

export function toCreatePurchaseResponse(
  purchase: PurchaseWithRelations,
  stockEffects: StockEffect[],
): CreatePurchaseResponse {
  return {
    ...toPurchaseResponse(purchase),
    stockEffects,
  };
}
