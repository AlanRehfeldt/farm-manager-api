import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  TRANSACTION_REPOSITORY,
  TransactionRepository,
} from '../repositories/transaction.repository';

@Injectable()
export class GetTransactionService {
  constructor(
    @Inject(TRANSACTION_REPOSITORY)
    private readonly transactionRepository: TransactionRepository,
  ) {}

  async execute(id: string) {
    const transaction = await this.transactionRepository.findById(id);

    if (!transaction) {
      throw new NotFoundException('Transaction does not exist');
    }

    return { transaction };
  }
}
