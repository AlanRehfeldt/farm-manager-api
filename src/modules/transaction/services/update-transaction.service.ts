import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  TRANSACTION_REPOSITORY,
  TransactionRepository,
} from '../repositories/transaction.repository';
import { UpdateTransactionData } from '../repositories/@types';

@Injectable()
export class UpdateTransactionService {
  constructor(
    @Inject(TRANSACTION_REPOSITORY)
    private readonly transactionRepository: TransactionRepository,
  ) {}

  async execute({ id, type, date, note }: UpdateTransactionData) {
    const checkIfTransactionExists =
      await this.transactionRepository.findById(id);
    if (!checkIfTransactionExists) {
      throw new NotFoundException('Transaction does not exist');
    }

    const transaction = await this.transactionRepository.update({
      id,
      type,
      date,
      note,
    });

    return { transaction };
  }
}
