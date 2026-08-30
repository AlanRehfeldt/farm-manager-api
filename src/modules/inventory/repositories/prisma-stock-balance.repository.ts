import { Injectable } from '@nestjs/common';
import { catalogVisibilityWhere } from 'src/common/tenancy/catalog-visibility';
import { decimalToString } from 'src/common/serialization/decimal';
import { PrismaService } from 'src/common/prisma/prisma.service';
import {
  SearchManyStockBalancesQuery,
  StockBalanceWithProduct,
} from './@types';
import { StockBalanceRepository } from './stock-balance.repository';

const productInclude = {
  product: {
    include: {
      unitOfMeasurement: {
        select: {
          id: true,
          name: true,
          acronym: true,
        },
      },
    },
  },
} as const;

type BalanceRow = Awaited<
  ReturnType<PrismaStockBalanceRepository['findBalances']>
>[number];

@Injectable()
export class PrismaStockBalanceRepository implements StockBalanceRepository {
  constructor(private prisma: PrismaService) {}

  async searchMany(
    query: SearchManyStockBalancesQuery,
  ): Promise<StockBalanceWithProduct[]> {
    const balances = await this.findBalances(query);
    return balances.map((balance) => this.mapBalance(balance));
  }

  async count(query: SearchManyStockBalancesQuery): Promise<number> {
    return await this.prisma.productStockBalance.count({
      where: this.buildWhere(query),
    });
  }

  private async findBalances(query: SearchManyStockBalancesQuery) {
    return await this.prisma.productStockBalance.findMany({
      where: this.buildWhere(query),
      include: productInclude,
      skip: (query.page - 1) * query.perPage,
      take: query.perPage,
      orderBy: {
        product: {
          [query.orderBy]: query.orderDirection,
        },
      },
    });
  }

  private buildWhere(query: SearchManyStockBalancesQuery) {
    return {
      farmId: query.farmId,
      product: {
        ...catalogVisibilityWhere(query.organizationId, query.farmId),
        ...(query.name
          ? { name: { contains: query.name, mode: 'insensitive' as const } }
          : {}),
      },
    };
  }

  private mapBalance(balance: BalanceRow): StockBalanceWithProduct {
    return {
      id: balance.id,
      farmId: balance.farmId,
      productId: balance.productId,
      quantityOnHand: decimalToString(balance.quantityOnHand)!,
      avgCost: decimalToString(balance.avgCost)!,
      product: {
        id: balance.product.id,
        name: balance.product.name,
        unitOfMeasurement: balance.product.unitOfMeasurement,
      },
      createdAt: balance.createdAt,
      updatedAt: balance.updatedAt,
    };
  }
}
