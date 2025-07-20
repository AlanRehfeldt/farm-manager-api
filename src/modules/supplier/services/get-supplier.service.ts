import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  SUPPLIER_REPOSITORY,
  SupplierRepository,
} from '../repositories/supplier.repository';

@Injectable()
export class GetSupplierService {
  constructor(
    @Inject(SUPPLIER_REPOSITORY)
    private readonly supplierRepository: SupplierRepository,
  ) {}

  async execute(id: string) {
    const supplier = await this.supplierRepository.findById(id);

    if (!supplier) {
      throw new NotFoundException('Supplier does not exist');
    }

    return { supplier };
  }
}
