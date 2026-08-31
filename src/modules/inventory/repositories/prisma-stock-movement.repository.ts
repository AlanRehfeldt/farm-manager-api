import { ConflictException, Injectable } from '@nestjs/common';
import { StockMovementSourceType, StockMovementType } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import {
  parseDecimal,
  decimalToString,
} from 'src/common/serialization/decimal';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { applyStockAdjustment } from '../domain/stock-adjustment';
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

      const existingBalance = await tx.productStockBalance.findUnique({
        where: {
          farmId_productId: {
            farmId: data.farmId,
            productId: data.productId,
          },
        },
      });

      const quantityBefore = existingBalance?.quantityOnHand ?? new Decimal(0);
      const avgCost = existingBalance?.avgCost ?? new Decimal(0);
      const quantityOnHand = applyStockAdjustment(
        quantityBefore,
        signedQuantity,
      );

      if (quantityOnHand.lt(0)) {
        throw new ConflictException(
          `Adjustment would result in negative stock: available ${quantityBefore.toString()}, adjustment ${signedQuantity.toString()}`,
        );
      }

      const movement = await tx.stockMovement.create({
        data: {
          id: movementId,
          farmId: data.farmId,
          type: StockMovementType.ADJUSTMENT,
          productId: data.productId,
          quantity: signedQuantity.abs(),
          date: data.date,
          note: data.note,
          sourceType: StockMovementSourceType.ADJUSTMENT,
          sourceId: movementId,
        },
      });

      await tx.productStockBalance.upsert({
        where: {
          farmId_productId: {
            farmId: data.farmId,
            productId: data.productId,
          },
        },
        create: {
          farmId: data.farmId,
          productId: data.productId,
          quantityOnHand,
          avgCost,
          version: 0,
        },
        update: {
          quantityOnHand,
          version: (existingBalance?.version ?? 0) + 1,
        },
      });

      return {
        movement,
        quantityOnHand: decimalToString(quantityOnHand)!,
        avgCost: decimalToString(avgCost)!,
      };
    });
  }
}
