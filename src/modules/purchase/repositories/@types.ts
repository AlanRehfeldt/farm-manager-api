import {
  Installment,
  PaymentForm,
  PurchaseTransaction,
  PurchaseTransactionProduct,
  Supplier,
  Transaction,
} from '@prisma/client';

export type PurchaseItemInput = {
  productId: string;
  quantity: string;
  priceInCents: number;
};

export type PurchaseInstallmentInput = {
  valueInCents: number;
  dueDate: Date;
  paymentDate?: Date | null;
  paymentForm: PaymentForm;
};

export type ProductMeta = {
  name: string;
  uomAcronym: string;
};

export type CreatePurchaseData = {
  farmId: string;
  date: Date;
  documentRef?: string | null;
  note?: string | null;
  supplierId: string;
  items: PurchaseItemInput[];
  installments: PurchaseInstallmentInput[];
  productMeta: Record<string, ProductMeta>;
};

export type StockEffect = {
  productName: string;
  quantity: string;
  uomAcronym: string;
  avgCost: string;
};

export type PurchaseProductWithProduct = PurchaseTransactionProduct & {
  product: {
    id: string;
    name: string;
    unitOfMeasurement: {
      id: string;
      acronym: string;
    };
  };
};

export type PurchaseWithRelations = PurchaseTransaction & {
  transaction: Transaction & {
    installments: Installment[];
  };
  supplier: Supplier;
  purchaseTransactionProducts: PurchaseProductWithProduct[];
};

export type CreatePurchaseResult = {
  purchase: PurchaseWithRelations;
  stockEffects: StockEffect[];
};

export type SearchManyPurchasesQuery = {
  farmId: string;
  name?: string;
  page: number;
  perPage: number;
  orderBy: string;
  orderDirection: 'asc' | 'desc';
};
