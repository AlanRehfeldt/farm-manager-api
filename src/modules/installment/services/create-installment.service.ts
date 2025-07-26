import { Inject, Injectable } from '@nestjs/common';
import {
  INSTALLMENT_REPOSITORY,
  InstallmentRepository,
} from '../repositories/installment.repository';
import { CreateInstallmentData } from '../repositories/@types';

@Injectable()
export class CreateInstallmentService {
  constructor(
    @Inject(INSTALLMENT_REPOSITORY)
    private readonly installmentRepository: InstallmentRepository,
  ) {}

  async execute({
    valueInCents,
    dueDate,
    paymentDate,
    paymentForm,
    transactionId,
  }: CreateInstallmentData) {
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
