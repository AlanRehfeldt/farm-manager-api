import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { UpdateTransactionData } from '../repositories/@types';
import {
  TRANSACTION_REPOSITORY,
  TransactionRepository,
} from '../repositories/transaction.repository';

@Injectable()
export class UpdateTransactionService {
  constructor(
    @Inject(TRANSACTION_REPOSITORY)
    private readonly transactionRepository: TransactionRepository,
  ) {}

  async execute(
    farmId: string,
    { id, type, date, note }: UpdateTransactionData,
  ) {
    const checkIfTransactionExists = await this.transactionRepository.findById(
      id,
      farmId,
    );
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
