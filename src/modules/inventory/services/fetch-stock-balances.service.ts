import { Inject, Injectable } from '@nestjs/common';
import {
  STOCK_BALANCE_REPOSITORY,
  StockBalanceRepository,
} from '../repositories/stock-balance.repository';
import { SearchManyStockBalancesQuery } from '../repositories/@types';

@Injectable()
export class FetchStockBalancesService {
  constructor(
    @Inject(STOCK_BALANCE_REPOSITORY)
    private readonly stockBalanceRepository: StockBalanceRepository,
  ) {}

  async execute(params: SearchManyStockBalancesQuery) {
    const results = await this.stockBalanceRepository.searchMany(params);
    const total = await this.stockBalanceRepository.count(params);

    return {
      results,
      total,
      page: params.page,
      perPage: params.perPage,
      orderBy: params.orderBy,
      orderDirection: params.orderDirection,
    };
  }
}
