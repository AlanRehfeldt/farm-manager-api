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

export type SearchManyStockBalancesQuery = {
  farmId: string;
  organizationId: string;
  name?: string;
  page: number;
  perPage: number;
  orderBy: string;
  orderDirection: 'asc' | 'desc';
};
