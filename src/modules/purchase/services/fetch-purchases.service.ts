import { Inject, Injectable } from '@nestjs/common';
import { toPurchaseResponse } from '../mappers/purchase.mapper';
import {
  PURCHASE_REPOSITORY,
  PurchaseRepository,
} from '../repositories/purchase.repository';
import { SearchManyPurchasesQuery } from '../repositories/@types';

@Injectable()
export class FetchPurchasesService {
  constructor(
    @Inject(PURCHASE_REPOSITORY)
    private readonly purchaseRepository: PurchaseRepository,
  ) {}

  async execute(params: SearchManyPurchasesQuery) {
    const purchases = await this.purchaseRepository.searchMany(params);
    const total = await this.purchaseRepository.count(params);

    return {
      results: purchases.map(toPurchaseResponse),
      total,
      page: params.page,
      perPage: params.perPage,
      orderBy: params.orderBy,
      orderDirection: params.orderDirection,
    };
  }
}
