import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  INSTALLMENT_REPOSITORY,
  InstallmentRepository,
} from '../repositories/installment.repository';
import { UpdateInstallmentData } from '../repositories/@types';

@Injectable()
export class UpdateInstallmentService {
  constructor(
    @Inject(INSTALLMENT_REPOSITORY)
    private readonly installmentRepository: InstallmentRepository,
  ) {}

  async execute({
    id,
    valueInCents,
    dueDate,
    paymentDate,
    paymentForm,
    transactionId,
  }: UpdateInstallmentData) {
    const checkIfInstallmentExists =
      await this.installmentRepository.findById(id);
    if (!checkIfInstallmentExists) {
      throw new NotFoundException('Installment does not exist');
    }

    // if (transactionId) {
    //   const checkIfTransactionExists =
    //     await this.installmentRepository.findByRegistration(registration);
    //   if (checkIfTransactionExists) {
    //     throw new ConflictException('Transaction does not exist');
    //   }
    // }

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
