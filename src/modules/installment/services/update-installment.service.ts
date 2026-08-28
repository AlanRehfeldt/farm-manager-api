import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  TRANSACTION_REPOSITORY,
  TransactionRepository,
} from 'src/modules/transaction/repositories/transaction.repository';
import { UpdateInstallmentData } from '../repositories/@types';
import {
  INSTALLMENT_REPOSITORY,
  InstallmentRepository,
} from '../repositories/installment.repository';

@Injectable()
export class UpdateInstallmentService {
  constructor(
    @Inject(INSTALLMENT_REPOSITORY)
    private readonly installmentRepository: InstallmentRepository,
    @Inject(TRANSACTION_REPOSITORY)
    private readonly transactionRepository: TransactionRepository,
  ) {}

  async execute(
    farmId: string,
    {
      id,
      valueInCents,
      dueDate,
      paymentDate,
      paymentForm,
      transactionId,
    }: UpdateInstallmentData,
  ) {
    const checkIfInstallmentExists = await this.installmentRepository.findById(
      id,
      farmId,
    );
    if (!checkIfInstallmentExists) {
      throw new NotFoundException('Installment does not exist');
    }

    if (transactionId) {
      const transaction = await this.transactionRepository.findById(
        transactionId,
        farmId,
      );
      if (!transaction) {
        throw new NotFoundException('Transaction does not exist');
      }
    }

    const installment = await this.installmentRepository.update({
      id,
      valueInCents,
      dueDate,
      paymentDate,
      paymentForm,
      transactionId,
    });

    return { installment };
  }
}
