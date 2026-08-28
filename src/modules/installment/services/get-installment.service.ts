import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  INSTALLMENT_REPOSITORY,
  InstallmentRepository,
} from '../repositories/installment.repository';

@Injectable()
export class GetInstallmentService {
  constructor(
    @Inject(INSTALLMENT_REPOSITORY)
    private readonly installmentRepository: InstallmentRepository,
  ) {}

  async execute(id: string, farmId: string) {
    const installment = await this.installmentRepository.findById(id, farmId);

    if (!installment) {
      throw new NotFoundException('Installment does not exist');
    }

    return { installment };
  }
}
