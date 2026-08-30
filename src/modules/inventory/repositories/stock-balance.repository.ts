import {
  SearchManyStockBalancesQuery,
  StockBalanceWithProduct,
} from './@types';

export interface StockBalanceRepository {
  searchMany(
    query: SearchManyStockBalancesQuery,
  ): Promise<StockBalanceWithProduct[]>;
  count(query: SearchManyStockBalancesQuery): Promise<number>;
}

export const STOCK_BALANCE_REPOSITORY = 'STOCK_BALANCE_REPOSITORY';
