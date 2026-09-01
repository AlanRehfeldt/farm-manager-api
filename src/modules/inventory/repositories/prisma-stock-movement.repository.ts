import { Injectable } from '@nestjs/common';
import {
  parseDecimal,
  decimalToString,
} from 'src/common/serialization/decimal';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { applyStockAdjustmentLedger } from '../domain/stock-ledger';
import { CreateStockAdjustmentData, StockAdjustmentResult } from './@types';
import { StockMovementRepository } from './stock-movement.repository';

@Injectable()
export class PrismaStockMovementRepository implements StockMovementRepository {
  constructor(private prisma: PrismaService) {}

  async createAdjustment(
    data: CreateStockAdjustmentData,
  ): Promise<StockAdjustmentResult> {
    return await this.prisma.$transaction(async (tx) => {
      const signedQuantity = parseDecimal(data.quantity);
      const movementId = data.id;

      const { quantityOnHand, avgCost } = await applyStockAdjustmentLedger(tx, {
        movementId,
        farmId: data.farmId,
        productId: data.productId,
        signedQuantity,
        date: data.date,
        note: data.note,
      });

      const movement = await tx.stockMovement.findUniqueOrThrow({
        where: { id: movementId },
      });

      return {
        movement,
        quantityOnHand: decimalToString(quantityOnHand)!,
        avgCost: decimalToString(avgCost)!,
      };
    });
  }
}
