import { StockMovement } from '@prisma/client';

export type SearchManyStockBalancesQuery = {
  farmId: string;
  organizationId: string;
  name?: string;
  page: number;
  perPage: number;
  orderBy: string;
  orderDirection: 'asc' | 'desc';
};

export type StockBalanceWithProduct = {
  id: string;
  farmId: string;
  productId: string;
  quantityOnHand: string;
  avgCost: string;
  product: {
    id: string;
    name: string;
    unitOfMeasurement: {
      id: string;
      name: string;
      acronym: string;
    };
  };
  createdAt: Date;
  updatedAt: Date;
};

export type CreateStockAdjustmentData = {
  id: string;
  farmId: string;
  productId: string;
  quantity: string;
  date: Date;
  note: string;
};

export type StockAdjustmentResult = {
  movement: StockMovement;
  quantityOnHand: string;
  avgCost: string;
};
