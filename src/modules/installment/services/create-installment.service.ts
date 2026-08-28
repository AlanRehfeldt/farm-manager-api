import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PaymentForm } from '@prisma/client';
import {
  TRANSACTION_REPOSITORY,
  TransactionRepository,
} from 'src/modules/transaction/repositories/transaction.repository';
import {
  INSTALLMENT_REPOSITORY,
  InstallmentRepository,
} from '../repositories/installment.repository';

type CreateInstallmentInput = {
  valueInCents: number;
  dueDate: Date;
  paymentDate?: Date;
  paymentForm: PaymentForm;
  transactionId: string;
  farmId: string;
};

@Injectable()
export class CreateInstallmentService {
  constructor(
    @Inject(INSTALLMENT_REPOSITORY)
    private readonly installmentRepository: InstallmentRepository,
    @Inject(TRANSACTION_REPOSITORY)
    private readonly transactionRepository: TransactionRepository,
  ) {}

  async execute({
    valueInCents,
    dueDate,
    paymentDate,
    paymentForm,
    transactionId,
    farmId,
  }: CreateInstallmentInput) {
    const transaction = await this.transactionRepository.findById(
      transactionId,
      farmId,
    );
    if (!transaction) {
      throw new NotFoundException('Transaction does not exist');
    }

    const installment = await this.installmentRepository.create({
      valueInCents: BigInt(valueInCents),
      dueDate,
      paymentDate,
      paymentForm,
      transactionId,
    });

    return { installment };
  }
}
