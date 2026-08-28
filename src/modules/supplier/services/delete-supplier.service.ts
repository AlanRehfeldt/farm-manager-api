import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  SUPPLIER_REPOSITORY,
  SupplierRepository,
} from '../repositories/supplier.repository';

@Injectable()
export class DeleteSupplierService {
  constructor(
    @Inject(SUPPLIER_REPOSITORY)
    private readonly supplierRepository: SupplierRepository,
  ) {}

  async execute(id: string, organizationId: string, farmId: string) {
    const checkIfSupplierExists = await this.supplierRepository.findById(
      id,
      organizationId,
      farmId,
    );
    if (!checkIfSupplierExists) {
      throw new NotFoundException('Supplier does not exist');
    }

    return await this.supplierRepository.delete(id);
  }
}
