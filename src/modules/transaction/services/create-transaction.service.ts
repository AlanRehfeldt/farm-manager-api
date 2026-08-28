import { Inject, Injectable } from '@nestjs/common';
import { TransactionType } from '@prisma/client';
import {
  TRANSACTION_REPOSITORY,
  TransactionRepository,
} from '../repositories/transaction.repository';

type CreateTransactionInput = {
  type: TransactionType;
  date: Date;
  note?: string;
  farmId: string;
};

@Injectable()
export class CreateTransactionService {
  constructor(
    @Inject(TRANSACTION_REPOSITORY)
    private readonly transactionRepository: TransactionRepository,
  ) {}

  async execute({ type, date, note, farmId }: CreateTransactionInput) {
    const transaction = await this.transactionRepository.create({
      type,
      date,
      note,
      farmId,
    });

    return { transaction };
  }
}
