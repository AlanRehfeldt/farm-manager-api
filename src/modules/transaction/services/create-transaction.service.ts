import { Inject, Injectable } from '@nestjs/common';
import {
  TRANSACTION_REPOSITORY,
  TransactionRepository,
} from '../repositories/transaction.repository';
import { CreateTransactionData } from '../repositories/@types';

@Injectable()
export class CreateTransactionService {
  constructor(
    @Inject(TRANSACTION_REPOSITORY)
    private readonly transactionRepository: TransactionRepository,
  ) {}

  async execute({ type, date, note }: CreateTransactionData) {
    const transaction = await this.transactionRepository.create({
      type,
      date,
      note,
    });

    return { transaction };
  }
}
