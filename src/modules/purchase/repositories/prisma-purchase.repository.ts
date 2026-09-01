import { Injectable } from '@nestjs/common';
import { TransactionType } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { parseDecimal } from 'src/common/serialization/decimal';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { applyStockIn } from 'src/modules/inventory/domain/stock-ledger';
import {
  CreatePurchaseData,
  CreatePurchaseResult,
  PurchaseWithRelations,
  SearchManyPurchasesQuery,
  StockEffect,
} from './@types';
import { PurchaseRepository } from './purchase.repository';

const purchaseInclude = {
  transaction: {
    include: {
      installments: true,
    },
  },
  supplier: true,
  purchaseTransactionProducts: {
    include: {
      product: {
        include: {
          unitOfMeasurement: {
            select: {
              id: true,
              acronym: true,
            },
          },
        },
      },
    },
  },
} as const;

@Injectable()
export class PrismaPurchaseRepository implements PurchaseRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: CreatePurchaseData): Promise<CreatePurchaseResult> {
    return await this.prisma.$transaction(async (tx) => {
      const transaction = await tx.transaction.create({
        data: {
          farmId: data.farmId,
          type: TransactionType.PURCHASE_INPUT,
          date: data.date,
          note: data.note,
        },
      });

      const purchaseTransaction = await tx.purchaseTransaction.create({
        data: {
          supplierId: data.supplierId,
          transactionId: transaction.id,
          documentRef: data.documentRef,
        },
      });

      for (const item of data.items) {
        await tx.purchaseTransactionProduct.create({
          data: {
            quantity: parseDecimal(item.quantity),
            priceInCents: BigInt(item.priceInCents),
            productId: item.productId,
            purchaseTransactionId: purchaseTransaction.id,
          },
        });
      }

      for (const installment of data.installments) {
        await tx.installment.create({
          data: {
            valueInCents: BigInt(installment.valueInCents),
            dueDate: installment.dueDate,
            paymentDate: installment.paymentDate,
            paymentForm: installment.paymentForm,
            transactionId: transaction.id,
          },
        });
      }

      const stockEffects: StockEffect[] = [];

      for (const item of data.items) {
        const quantity = parseDecimal(item.quantity);
        const unitPriceInReais = new Decimal(item.priceInCents).div(100);
        const meta = data.productMeta[item.productId];

        const { avgCost } = await applyStockIn(tx, {
          farmId: data.farmId,
          productId: item.productId,
          quantity,
          unitPriceInReais,
          date: data.date,
          transactionId: transaction.id,
        });

        stockEffects.push({
          productName: meta.name,
          quantity: quantity.toString(),
          uomAcronym: meta.uomAcronym,
          avgCost: avgCost.toString(),
        });
      }

      const purchase = await tx.purchaseTransaction.findUniqueOrThrow({
        where: { id: purchaseTransaction.id },
        include: purchaseInclude,
      });

      return { purchase, stockEffects };
    });
  }

  async findById(
    id: string,
    farmId: string,
  ): Promise<PurchaseWithRelations | null> {
    return await this.prisma.purchaseTransaction.findFirst({
      where: {
        id,
        transaction: {
          farmId,
          type: TransactionType.PURCHASE_INPUT,
        },
      },
      include: purchaseInclude,
    });
  }

  async searchMany(
    query: SearchManyPurchasesQuery,
  ): Promise<PurchaseWithRelations[]> {
    return await this.prisma.purchaseTransaction.findMany({
      where: {
        transaction: {
          farmId: query.farmId,
          type: TransactionType.PURCHASE_INPUT,
        },
        ...(query.name
          ? {
              OR: [
                {
                  supplier: {
                    name: { contains: query.name, mode: 'insensitive' },
                  },
                },
                {
                  documentRef: { contains: query.name, mode: 'insensitive' },
                },
              ],
            }
          : {}),
      },
      include: purchaseInclude,
      skip: (query.page - 1) * query.perPage,
      take: query.perPage,
      orderBy: {
        transaction: {
          [query.orderBy]: query.orderDirection,
        },
      },
    });
  }

  async count(query: SearchManyPurchasesQuery): Promise<number> {
    return await this.prisma.purchaseTransaction.count({
      where: {
        transaction: {
          farmId: query.farmId,
          type: TransactionType.PURCHASE_INPUT,
        },
        ...(query.name
          ? {
              OR: [
                {
                  supplier: {
                    name: { contains: query.name, mode: 'insensitive' },
                  },
                },
                {
                  documentRef: { contains: query.name, mode: 'insensitive' },
                },
              ],
            }
          : {}),
      },
    });
  }
}
