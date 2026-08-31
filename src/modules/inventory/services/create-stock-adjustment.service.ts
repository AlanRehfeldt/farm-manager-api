import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import {
  PRODUCT_REPOSITORY,
  ProductRepository,
} from 'src/modules/product/repositories/product.repository';
import {
  STOCK_MOVEMENT_REPOSITORY,
  StockMovementRepository,
} from '../repositories/stock-movement.repository';

type CreateStockAdjustmentInput = {
  farmId: string;
  organizationId: string;
  productId: string;
  quantity: string;
  date: Date;
  note: string;
};

@Injectable()
export class CreateStockAdjustmentService {
  constructor(
    @Inject(STOCK_MOVEMENT_REPOSITORY)
    private readonly stockMovementRepository: StockMovementRepository,
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: ProductRepository,
  ) {}

  async execute(input: CreateStockAdjustmentInput) {
    const qty = Number(input.quantity);
    if (Number.isNaN(qty) || qty === 0) {
      throw new BadRequestException('Quantity must be non-zero');
    }

    if (!input.note?.trim()) {
      throw new BadRequestException('Adjustment reason is required');
    }

    const product = await this.productRepository.findById(
      input.productId,
      input.organizationId,
      input.farmId,
    );
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const result = await this.stockMovementRepository.createAdjustment({
      id: randomUUID(),
      farmId: input.farmId,
      productId: input.productId,
      quantity: input.quantity,
      date: input.date,
      note: input.note.trim(),
    });

    return {
      id: result.movement.id,
      productId: input.productId,
      productName: product.name,
      quantity: input.quantity,
      date: result.movement.date,
      note: result.movement.note,
      quantityOnHand: result.quantityOnHand,
      avgCost: result.avgCost,
    };
  }
}
