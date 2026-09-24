import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CostEntrySourceType, TransactionType } from '@prisma/client';
import { parseDecimal } from 'src/common/serialization/decimal';
import { assertActiveCropSeasonLocked } from 'src/common/prisma/crop-season-lock';
import { PrismaService } from 'src/common/prisma/prisma.service';
import {
  applyCompensatoryStockIn,
  applyStockOut as applyStockOutLedger,
} from 'src/modules/inventory/domain/stock-ledger';
import { isActivityFullyReversed } from '../domain/is-activity-fully-reversed';
import { computeConsumptionAmountInCents } from '../domain/consumption-cost';
import { computeHourlyAmountInCents } from '../domain/hourly-cost';
import {
  ActivityStockEffect,
  CreateActivityData,
  CreateActivityResult,
  ReverseActivityData,
  ReverseActivityResult,
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
      await assertActiveCropSeasonLocked(tx, data.cropSeasonId, data.farmId);

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

        const { quantityOnHand, unitCostSnapshot } = await applyStockOutLedger(
          tx,
          {
            farmId: data.farmId,
            productId: item.productId,
            quantity,
            date: data.date,
            sourceId: activity.id,
            productName: meta.name,
          },
        );

        const activityInput = await tx.activityInput.create({
          data: {
            activityId: activity.id,
            productId: item.productId,
            quantity,
            unitCostSnapshot,
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
            costCategoryId: meta.costCategoryId,
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
        const costCategoryId =
          item.employeeId != null &&
          data.employeeMeta[item.employeeId]?.employmentType === 'CLT'
            ? data.costCategoryIds.moFixa
            : data.costCategoryIds.moTemporaria;

        const isOpenClt =
          item.employeeId != null &&
          data.employeeMeta[item.employeeId]?.employmentType === 'CLT' &&
          item.costInCents == null;

        const activityLabor = await tx.activityLabor.create({
          data: {
            activityId: activity.id,
            employeeId: item.employeeId ?? null,
            contractorName: item.contractorName ?? null,
            payBasis: item.payBasis,
            hours: item.hours ? parseDecimal(item.hours) : null,
            days: item.days ? parseDecimal(item.days) : null,
            outputQty: item.outputQty ? parseDecimal(item.outputQty) : null,
            hourlyRateInCents:
              item.hourlyRateInCents != null
                ? BigInt(item.hourlyRateInCents)
                : null,
            costInCents:
              item.costInCents != null ? BigInt(item.costInCents) : null,
          },
        });

        if (!isOpenClt && item.costInCents != null) {
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

  async reverse(data: ReverseActivityData): Promise<ReverseActivityResult> {
    return await this.prisma.$transaction(async (tx) => {
      const activity = await tx.activity.findFirst({
        where: { id: data.activityId, farmId: data.farmId },
        include: {
          inputs: {
            include: {
              product: { select: { id: true, name: true } },
            },
          },
          labor: true,
          costEntries: true,
        },
      });

      if (!activity) {
        throw new NotFoundException('Activity not found');
      }

      await assertActiveCropSeasonLocked(
        tx,
        activity.cropSeasonId,
        data.farmId,
      );

      const openCltLabor = activity.labor.filter(
        (line) => line.costInCents == null && line.employeeId != null,
      );

      const originalEntries = activity.costEntries.filter(
        (entry) => entry.sourceType !== CostEntrySourceType.REVERSAL,
      );
      const openOriginalEntries = originalEntries.filter(
        (entry) => entry.reversedAt === null,
      );

      if (openOriginalEntries.length === 0 && openCltLabor.length === 0) {
        throw new ConflictException(
          originalEntries.length > 0
            ? 'Activity has already been reversed'
            : 'Activity has no cost entries to reverse',
        );
      }

      for (const line of openCltLabor) {
        await tx.activityLabor.delete({ where: { id: line.id } });
      }

      if (
        openOriginalEntries.some(
          (entry) => entry.sourceType === CostEntrySourceType.ACTIVITY_INPUT,
        )
      ) {
        for (const input of activity.inputs) {
          const quantity = parseDecimal(input.quantity.toString());

          await applyCompensatoryStockIn(tx, {
            farmId: data.farmId,
            productId: input.productId,
            quantity,
            date: data.reversedAt,
            sourceId: activity.id,
            note: `Estorno: ${data.reason}`,
          });
        }
      }

      for (const entry of openOriginalEntries) {
        await tx.costEntry.update({
          where: { id: entry.id },
          data: { reversedAt: data.reversedAt },
        });

        await tx.costEntry.create({
          data: {
            farmId: entry.farmId,
            cropSeasonId: entry.cropSeasonId,
            fieldId: entry.fieldId,
            activityId: entry.activityId,
            sourceType: CostEntrySourceType.REVERSAL,
            sourceId: entry.id,
            costCategoryId: entry.costCategoryId,
            amountInCents: -entry.amountInCents,
            quantity: entry.quantity,
            uomId: entry.uomId,
            date: data.reversedAt,
            reversalOfId: entry.id,
          },
        });
      }

      // Linhas MO já custeadas (fechamento CLT ou empreitada): removidas após
      // estornar CostEntry, para não reaparecerem como horas abertas na reabertura.
      const closedLabor = activity.labor.filter(
        (line) => line.costInCents != null,
      );
      for (const line of closedLabor) {
        await tx.activityLabor.delete({ where: { id: line.id } });
      }

      const reversalNote = `[Estornado em ${data.reversedAt.toISOString()}] ${data.reason}`;
      const updatedNote = activity.note
        ? `${activity.note}\n${reversalNote}`
        : reversalNote;

      await tx.activity.update({
        where: { id: activity.id },
        data: { note: updatedNote },
      });

      const fullActivity = await tx.activity.findUniqueOrThrow({
        where: { id: activity.id },
        include: activityInclude,
      });

      return { activity: fullActivity };
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

  async hasEmployeeLaborInOrgMonth(
    employeeId: string,
    organizationId: string,
    year: number,
    month: number,
  ): Promise<boolean> {
    const start = new Date(Date.UTC(year, month - 1, 1));
    const end = new Date(Date.UTC(year, month, 1));

    const rows = await this.prisma.activityLabor.findMany({
      where: {
        employeeId,
        activity: {
          date: {
            gte: start,
            lt: end,
          },
          farm: {
            organizationId,
          },
        },
      },
      select: {
        costInCents: true,
        activity: {
          select: {
            costEntries: {
              select: { sourceType: true, reversedAt: true },
            },
          },
        },
      },
    });

    return rows.some((row) => {
      // Horas CLT abertas (estorno F9 apaga a linha; reabertura zera costInCents)
      if (row.costInCents == null) {
        return true;
      }
      return !isActivityFullyReversed(row.activity.costEntries);
    });
  }

  async hasSalaryAllocationInOrgMonth(
    employeeId: string,
    organizationId: string,
    year: number,
    month: number,
  ): Promise<boolean> {
    const start = new Date(Date.UTC(year, month - 1, 1));
    const end = new Date(Date.UTC(year, month, 1));

    const count = await this.prisma.transactionAllocation.count({
      where: {
        transaction: {
          type: TransactionType.SALARY_PAYMENT,
          date: {
            gte: start,
            lt: end,
          },
          farm: {
            organizationId,
          },
          salaryTransaction: {
            employeeId,
          },
        },
      },
    });

    return count > 0;
  }

  async hasLaborMonthClosing(
    employeeId: string,
    year: number,
    month: number,
  ): Promise<boolean> {
    const count = await this.prisma.laborMonthClosing.count({
      where: { employeeId, year, month },
    });
    return count > 0;
  }
}
