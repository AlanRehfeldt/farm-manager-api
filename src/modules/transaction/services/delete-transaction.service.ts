import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  TRANSACTION_REPOSITORY,
  TransactionRepository,
} from '../repositories/transaction.repository';

@Injectable()
export class DeleteTransactionService {
  constructor(
    @Inject(TRANSACTION_REPOSITORY)
    private readonly transactionRepository: TransactionRepository,
  ) {}

  async execute(id: string) {
    const checkIfTransactionExists =
      await this.transactionRepository.findById(id);
    if (!checkIfTransactionExists) {
      throw new NotFoundException('Transaction does not exist');
    }

    return await this.transactionRepository.delete(id);
  }
}
