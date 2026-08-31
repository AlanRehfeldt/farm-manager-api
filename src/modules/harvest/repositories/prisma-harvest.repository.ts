import { Injectable } from '@nestjs/common';
import { Decimal } from '@prisma/client/runtime/library';
import { parseDecimal } from 'src/common/serialization/decimal';
import { PrismaService } from 'src/common/prisma/prisma.service';
import {
  CreateHarvestData,
  CreateHarvestResult,
  HarvestSeasonTotals,
  HarvestWithRelations,
  SearchManyHarvestsQuery,
} from './@types';
import { HarvestRepository } from './harvest.repository';

const harvestInclude = {
  cropSeason: {
    select: {
      id: true,
      name: true,
      status: true,
      productionUomId: true,
    },
  },
  field: {
    select: {
      id: true,
      name: true,
      areaHa: true,
    },
  },
  items: {
    include: {
      uom: {
        select: {
          id: true,
          name: true,
          acronym: true,
        },
      },
    },
  },
} as const;

@Injectable()
export class PrismaHarvestRepository implements HarvestRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateHarvestData): Promise<CreateHarvestResult> {
    const harvest = await this.prisma.harvest.create({
      data: {
        farmId: data.farmId,
        cropSeasonId: data.cropSeasonId,
        fieldId: data.fieldId,
        date: data.date,
        lotCode: data.lotCode,
        note: data.note,
        items: {
          create: data.items.map((item) => ({
            qualityClass: item.qualityClass,
            quantity: parseDecimal(item.quantity),
            uomId: item.uomId,
          })),
        },
      },
      include: harvestInclude,
    });

    return { harvest: harvest as HarvestWithRelations };
  }

  async findById(
    id: string,
    farmId: string,
  ): Promise<HarvestWithRelations | null> {
    return (await this.prisma.harvest.findFirst({
      where: { id, farmId },
      include: harvestInclude,
    })) as HarvestWithRelations | null;
  }

  private buildWhereClause(query: SearchManyHarvestsQuery) {
    return {
      farmId: query.farmId,
      cropSeasonId: query.cropSeasonId,
      ...(query.name
        ? {
            OR: [
              { note: { contains: query.name, mode: 'insensitive' as const } },
              {
                lotCode: { contains: query.name, mode: 'insensitive' as const },
              },
              {
                field: {
                  name: { contains: query.name, mode: 'insensitive' as const },
                },
              },
            ],
          }
        : {}),
    };
  }

  async searchMany(
    query: SearchManyHarvestsQuery,
  ): Promise<HarvestWithRelations[]> {
    return (await this.prisma.harvest.findMany({
      where: this.buildWhereClause(query),
      include: harvestInclude,
      skip: (query.page - 1) * query.perPage,
      take: query.perPage,
      orderBy: { [query.orderBy]: query.orderDirection },
    })) as HarvestWithRelations[];
  }

  async count(query: SearchManyHarvestsQuery): Promise<number> {
    return await this.prisma.harvest.count({
      where: this.buildWhereClause(query),
    });
  }

  async sumSeasonQuantity(
    farmId: string,
    cropSeasonId: string,
    productionUomId: string,
  ): Promise<HarvestSeasonTotals> {
    const items = await this.prisma.harvestItem.findMany({
      where: {
        uomId: productionUomId,
        harvest: {
          farmId,
          cropSeasonId,
        },
      },
      select: {
        quantity: true,
      },
    });

    const total = items.reduce(
      (sum, item) => sum.plus(item.quantity),
      new Decimal(0),
    );

    return {
      harvestedQuantity: total.toString(),
      productionUomId,
    };
  }
}
