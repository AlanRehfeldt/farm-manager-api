import { Inject, Injectable } from '@nestjs/common';
import {
  SUPPLIER_REPOSITORY,
  SupplierRepository,
} from '../repositories/supplier.repository';
import { SearchManyQuery } from '../repositories/@types';

@Injectable()
export class FetchSuppliersService {
  constructor(
    @Inject(SUPPLIER_REPOSITORY)
    private readonly supplierRepository: SupplierRepository,
  ) {}

  async execute(params: SearchManyQuery) {
    const suppliers = await this.supplierRepository.searchMany(params);
    const total = await this.supplierRepository.count(params);

    return {
      results: suppliers,
      total,
      page: params.page,
      perPage: params.perPage,
      orderBy: params.orderBy,
      orderDirection: params.orderDirection,
    };
  }
}
