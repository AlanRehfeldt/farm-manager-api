import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { toPurchaseResponse } from '../mappers/purchase.mapper';
import {
  PURCHASE_REPOSITORY,
  PurchaseRepository,
} from '../repositories/purchase.repository';

@Injectable()
export class GetPurchaseService {
  constructor(
    @Inject(PURCHASE_REPOSITORY)
    private readonly purchaseRepository: PurchaseRepository,
  ) {}

  async execute(id: string, farmId: string) {
    const purchase = await this.purchaseRepository.findById(id, farmId);
    if (!purchase) {
      throw new NotFoundException('Purchase not found');
    }

    return { purchase: toPurchaseResponse(purchase) };
  }
}
