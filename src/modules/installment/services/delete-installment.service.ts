import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  INSTALLMENT_REPOSITORY,
  InstallmentRepository,
} from '../repositories/installment.repository';

@Injectable()
export class DeleteInstallmentService {
  constructor(
    @Inject(INSTALLMENT_REPOSITORY)
    private readonly installmentRepository: InstallmentRepository,
  ) {}

  async execute(id: string, farmId: string) {
    const checkIfInstallmentExists = await this.installmentRepository.findById(
      id,
      farmId,
    );
    if (!checkIfInstallmentExists) {
      throw new NotFoundException('Installment does not exist');
    }

    return await this.installmentRepository.delete(id);
  }
}
