import { ConflictException, Injectable } from '@nestjs/common';
import {
  CostEntrySourceType,
  StockMovementSourceType,
  StockMovementType,
} from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { parseDecimal } from 'src/common/serialization/decimal';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { computeConsumptionAmountInCents } from '../domain/consumption-cost';
import { computeHourlyAmountInCents } from '../domain/hourly-cost';
import { applyStockOut } from 'src/modules/inventory/domain/stock-out';
import {
  ActivityStockEffect,
  CreateActivityData,
  CreateActivityResult,
  SearchManyActivitiesQuery,
  ActivityWithRelations,
} from './@types';
import { ActivityRepository } from './activity.repository';

const activityInclude = {
  field: {
    select: {
      id: true,
      name: true,
    },
  },
  cropSeason: {
    include: {
      crop: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  },
  inputs: {
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
  labor: {
    include: {
      employee: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  },
  machineHours: {
    include: {
      machine: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  },
  costEntries: true,
} as const;

@Injectable()
export class PrismaActivityRepository implements ActivityRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateActivityData): Promise<CreateActivityResult> {
    return await this.prisma.$transaction(async (tx) => {
      const activity = await tx.activity.create({
        data: {
          farmId: data.farmId,
          cropSeasonId: data.cropSeasonId,
          fieldId: data.fieldId,
          activityType: data.activityType,
          date: data.date,
          note: data.note,
          createdByUserId: data.createdByUserId,
        },
      });

      const stockEffects: ActivityStockEffect[] = [];

      for (const item of data.inputs) {
        const quantity = parseDecimal(item.quantity);
        const meta = data.productMeta[item.productId];

        const existingBalance = await tx.productStockBalance.findUnique({
          where: {
            farmId_productId: {
              farmId: data.farmId,
              productId: item.productId,
            },
          },
        });

        const quantityBefore =
          existingBalance?.quantityOnHand ?? new Decimal(0);
        const unitCostSnapshot = existingBalance?.avgCost ?? new Decimal(0);

        if (quantity.gt(quantityBefore)) {
          throw new ConflictException(
            `Insufficient stock for ${meta.name}: available ${quantityBefore.toString()}, requested ${quantity.toString()}`,
          );
        }

        const activityInput = await tx.activityInput.create({
          data: {
            activityId: activity.id,
            productId: item.productId,
            quantity,
            unitCostSnapshot,
          },
        });

        await tx.stockMovement.create({
          data: {
            farmId: data.farmId,
            type: StockMovementType.OUT,
            productId: item.productId,
            quantity,
            date: data.date,
            sourceType: StockMovementSourceType.ACTIVITY,
            sourceId: activity.id,
          },
        });

        const quantityOnHand = applyStockOut(quantityBefore, quantity);
        const avgCost = existingBalance?.avgCost ?? new Decimal(0);

        await tx.productStockBalance.upsert({
          where: {
            farmId_productId: {
              farmId: data.farmId,
              productId: item.productId,
            },
          },
          create: {
            farmId: data.farmId,
            productId: item.productId,
            quantityOnHand,
            avgCost,
            version: 0,
          },
          update: {
            quantityOnHand,
            version: (existingBalance?.version ?? 0) + 1,
          },
        });

        const amountInCents = computeConsumptionAmountInCents(
          quantity,
          unitCostSnapshot,
        );

        await tx.costEntry.create({
          data: {
            farmId: data.farmId,
            cropSeasonId: data.cropSeasonId,
            fieldId: data.fieldId,
            activityId: activity.id,
            sourceType: CostEntrySourceType.ACTIVITY_INPUT,
            sourceId: activityInput.id,
            costCategoryId: data.costCategoryIds.defaultInput,
            amountInCents,
            quantity,
            uomId: meta.uomId,
            date: data.date,
          },
        });

        stockEffects.push({
          productName: meta.name,
          quantity: quantity.toString(),
          uomAcronym: meta.uomAcronym,
          quantityRemaining: quantityOnHand.toString(),
          amountInCents: Number(amountInCents),
        });
      }

      for (const item of data.labor) {
        const costCategoryId = item.employeeId
          ? data.costCategoryIds.moFixa
          : data.costCategoryIds.moTemporaria;

        const activityLabor = await tx.activityLabor.create({
          data: {
            activityId: activity.id,
            employeeId: item.employeeId ?? null,
            contractorName: item.contractorName ?? null,
            payBasis: item.payBasis,
            hours: item.hours ? parseDecimal(item.hours) : null,
            days: item.days ? parseDecimal(item.days) : null,
            outputQty: item.outputQty ? parseDecimal(item.outputQty) : null,
            costInCents: BigInt(item.costInCents),
          },
        });

        await tx.costEntry.create({
          data: {
            farmId: data.farmId,
            cropSeasonId: data.cropSeasonId,
            fieldId: data.fieldId,
            activityId: activity.id,
            sourceType: CostEntrySourceType.ACTIVITY_LABOR,
            sourceId: activityLabor.id,
            costCategoryId,
            amountInCents: BigInt(item.costInCents),
            date: data.date,
          },
        });
      }

      for (const item of data.machineHours) {
        const meta = data.machineMeta[item.machineId];
        const hours = parseDecimal(item.hours);
        const hourlyCostSnapshot = meta.hourlyCostInCents;
        const costInCents = computeHourlyAmountInCents(
          hours,
          hourlyCostSnapshot,
        );

        const activityMachineHour = await tx.activityMachineHour.create({
          data: {
            activityId: activity.id,
            machineId: item.machineId,
            hours,
            hourlyCostSnapshot,
            costInCents,
          },
        });

        await tx.costEntry.create({
          data: {
            farmId: data.farmId,
            cropSeasonId: data.cropSeasonId,
            fieldId: data.fieldId,
            activityId: activity.id,
            sourceType: CostEntrySourceType.ACTIVITY_MACHINE,
            sourceId: activityMachineHour.id,
            costCategoryId: data.costCategoryIds.maquina,
            amountInCents: costInCents,
            quantity: hours,
            date: data.date,
          },
        });
      }

      const fullActivity = await tx.activity.findUniqueOrThrow({
        where: { id: activity.id },
        include: activityInclude,
      });

      return { activity: fullActivity, stockEffects };
    });
  }

  async findById(
    id: string,
    farmId: string,
  ): Promise<ActivityWithRelations | null> {
    return await this.prisma.activity.findFirst({
      where: { id, farmId },
      include: activityInclude,
    });
  }

  private buildWhereClause(query: SearchManyActivitiesQuery) {
    return {
      farmId: query.farmId,
      cropSeasonId: query.cropSeasonId,
      ...(query.activityType ? { activityType: query.activityType } : {}),
      ...(query.dateFrom || query.dateTo
        ? {
            date: {
              ...(query.dateFrom ? { gte: query.dateFrom } : {}),
              ...(query.dateTo ? { lte: query.dateTo } : {}),
            },
          }
        : {}),
      ...(query.name
        ? {
            OR: [
              {
                note: { contains: query.name, mode: 'insensitive' as const },
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
    query: SearchManyActivitiesQuery,
  ): Promise<ActivityWithRelations[]> {
    return await this.prisma.activity.findMany({
      where: this.buildWhereClause(query),
      include: activityInclude,
      skip: (query.page - 1) * query.perPage,
      take: query.perPage,
      orderBy: { [query.orderBy]: query.orderDirection },
    });
  }

  async count(query: SearchManyActivitiesQuery): Promise<number> {
    return await this.prisma.activity.count({
      where: this.buildWhereClause(query),
    });
  }
}
