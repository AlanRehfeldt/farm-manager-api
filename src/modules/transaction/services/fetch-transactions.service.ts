import { Inject, Injectable } from '@nestjs/common';
import {
  TRANSACTION_REPOSITORY,
  TransactionRepository,
} from '../repositories/transaction.repository';
import { SearchManyQuery } from '../repositories/@types';

@Injectable()
export class FetchTransactionsService {
  constructor(
    @Inject(TRANSACTION_REPOSITORY)
    private readonly transactionRepository: TransactionRepository,
  ) {}

  async execute(params: SearchManyQuery) {
    const transactions = await this.transactionRepository.searchMany(params);
    const total = await this.transactionRepository.count(params);

    return {
      results: transactions,
      total,
      page: params.page,
      perPage: params.perPage,
      orderBy: params.orderBy,
      orderDirection: params.orderDirection,
    };
  }
}
