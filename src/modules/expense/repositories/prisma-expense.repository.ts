import { Injectable } from '@nestjs/common';
import { CostEntrySourceType, TransactionType } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { allocateByArea } from '../domain/allocate-by-area';
import {
  CreateExpenseData,
  CreateExpenseResult,
  ExpenseWithRelations,
  SearchManyExpensesQuery,
} from './@types';
import { ExpenseRepository } from './expense.repository';

const expenseInclude = {
  installments: true,
  transactionAllocations: {
    include: {
      costCenter: {
        select: { id: true, name: true, code: true },
      },
      accountPlan: {
        select: { id: true, name: true, code: true },
      },
      costCategory: {
        select: { id: true, code: true, name: true },
      },
      cropSeason: {
        select: { id: true, name: true, status: true },
      },
      field: {
        select: { id: true, name: true },
      },
    },
  },
  salaryTransaction: {
    include: {
      employee: {
        select: { id: true, name: true },
      },
    },
  },
  genericDetails: true,
} as const;

@Injectable()
export class PrismaExpenseRepository implements ExpenseRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateExpenseData): Promise<CreateExpenseResult> {
    return await this.prisma.$transaction(async (tx) => {
      const transaction = await tx.transaction.create({
        data: {
          farmId: data.farmId,
          type: data.type,
          date: data.date,
          note: data.note,
        },
      });

      if (data.type === TransactionType.GENERIC && data.genericSubtype) {
        await tx.genericTransactionDetails.create({
          data: {
            transactionId: transaction.id,
            subtype: data.genericSubtype,
          },
        });
      }

      if (data.type === TransactionType.SALARY_PAYMENT && data.employeeId) {
        await tx.salaryTransaction.create({
          data: {
            transactionId: transaction.id,
            employeeId: data.employeeId,
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

      for (const allocation of data.allocations) {
        const createdAllocation = await tx.transactionAllocation.create({
          data: {
            transactionId: transaction.id,
            costCenterId: allocation.costCenterId,
            accountPlanId: allocation.accountPlanId,
            costCategoryId: allocation.costCategoryId,
            cropSeasonId: allocation.cropSeasonId,
            fieldId: allocation.fieldId ?? null,
            allocatedValueInCents: BigInt(allocation.allocatedValueInCents),
          },
        });

        const amount = BigInt(allocation.allocatedValueInCents);

        if (allocation.fieldId) {
          await tx.costEntry.create({
            data: {
              farmId: data.farmId,
              cropSeasonId: allocation.cropSeasonId,
              fieldId: allocation.fieldId,
              sourceType: CostEntrySourceType.ALLOCATION,
              sourceId: createdAllocation.id,
              costCategoryId: allocation.costCategoryId,
              amountInCents: amount,
              date: data.date,
            },
          });
        } else {
          const plantings =
            data.plantingAreasBySeason[allocation.cropSeasonId] ?? [];

          if (plantings.length === 0) {
            await tx.costEntry.create({
              data: {
                farmId: data.farmId,
                cropSeasonId: allocation.cropSeasonId,
                fieldId: null,
                sourceType: CostEntrySourceType.ALLOCATION,
                sourceId: createdAllocation.id,
                costCategoryId: allocation.costCategoryId,
                amountInCents: amount,
                date: data.date,
              },
            });
          } else {
            const fieldAreas = plantings.map((planting) => ({
              fieldId: planting.fieldId,
              areaHa: new Decimal(planting.areaHa),
            }));

            const splits = allocateByArea(amount, fieldAreas);

            for (const split of splits) {
              await tx.costEntry.create({
                data: {
                  farmId: data.farmId,
                  cropSeasonId: allocation.cropSeasonId,
                  fieldId: split.fieldId,
                  sourceType: CostEntrySourceType.ALLOCATION,
                  sourceId: createdAllocation.id,
                  costCategoryId: allocation.costCategoryId,
                  amountInCents: split.amountInCents,
                  date: data.date,
                },
              });
            }
          }
        }
      }

      const expense = await tx.transaction.findUniqueOrThrow({
        where: { id: transaction.id },
        include: expenseInclude,
      });

      return {
        expense: await this.attachCostEntries(
          expense as Omit<ExpenseWithRelations, 'transactionAllocations'> & {
            transactionAllocations: Omit<
              ExpenseWithRelations['transactionAllocations'][number],
              'costEntries'
            >[];
          },
          tx,
        ),
      };
    });
  }

  private async attachCostEntries<
    T extends {
      transactionAllocations: Array<{ id: string }>;
    },
  >(
    expense: T,
    prisma:
      | Pick<PrismaService, 'costEntry'>
      | Parameters<Parameters<PrismaService['$transaction']>[0]>[0],
  ): Promise<ExpenseWithRelations> {
    const allocationIds = expense.transactionAllocations.map((a) => a.id);

    const costEntries =
      allocationIds.length === 0
        ? []
        : await prisma.costEntry.findMany({
            where: {
              sourceType: CostEntrySourceType.ALLOCATION,
              sourceId: { in: allocationIds },
            },
            include: {
              costCategory: {
                select: { id: true, code: true, name: true },
              },
              field: {
                select: { id: true, name: true },
              },
            },
          });

    const bySourceId = new Map<string, typeof costEntries>();
    for (const entry of costEntries) {
      const list = bySourceId.get(entry.sourceId) ?? [];
      list.push(entry);
      bySourceId.set(entry.sourceId, list);
    }

    return {
      ...expense,
      transactionAllocations: expense.transactionAllocations.map(
        (allocation) => ({
          ...allocation,
          costEntries: bySourceId.get(allocation.id) ?? [],
        }),
      ),
    } as unknown as ExpenseWithRelations;
  }

  async findById(
    id: string,
    farmId: string,
  ): Promise<ExpenseWithRelations | null> {
    const expense = await this.prisma.transaction.findFirst({
      where: {
        id,
        farmId,
        type: {
          in: [TransactionType.GENERIC, TransactionType.SALARY_PAYMENT],
        },
      },
      include: expenseInclude,
    });

    if (!expense) {
      return null;
    }

    return this.attachCostEntries(expense, this.prisma);
  }

  async searchMany(
    query: SearchManyExpensesQuery,
  ): Promise<ExpenseWithRelations[]> {
    const expenses = await this.prisma.transaction.findMany({
      where: {
        farmId: query.farmId,
        type: {
          in: [TransactionType.GENERIC, TransactionType.SALARY_PAYMENT],
        },
        ...(query.name
          ? {
              OR: [
                { note: { contains: query.name, mode: 'insensitive' } },
                {
                  genericDetails: {
                    note: { contains: query.name, mode: 'insensitive' },
                  },
                },
                {
                  salaryTransaction: {
                    employee: {
                      name: { contains: query.name, mode: 'insensitive' },
                    },
                  },
                },
              ],
            }
          : {}),
      },
      include: expenseInclude,
      skip: (query.page - 1) * query.perPage,
      take: query.perPage,
      orderBy: {
        [query.orderBy]: query.orderDirection,
      },
    });

    return Promise.all(
      expenses.map((expense) => this.attachCostEntries(expense, this.prisma)),
    );
  }

  async count(query: SearchManyExpensesQuery): Promise<number> {
    return await this.prisma.transaction.count({
      where: {
        farmId: query.farmId,
        type: {
          in: [TransactionType.GENERIC, TransactionType.SALARY_PAYMENT],
        },
        ...(query.name
          ? {
              OR: [
                { note: { contains: query.name, mode: 'insensitive' } },
                {
                  genericDetails: {
                    note: { contains: query.name, mode: 'insensitive' },
                  },
                },
                {
                  salaryTransaction: {
                    employee: {
                      name: { contains: query.name, mode: 'insensitive' },
                    },
                  },
                },
              ],
            }
          : {}),
      },
    });
  }
}
