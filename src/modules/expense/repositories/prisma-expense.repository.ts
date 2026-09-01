import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CostEntrySourceType, TransactionType } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { assertActiveCropSeasonLocked } from 'src/common/prisma/crop-season-lock';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { allocateByArea } from '../domain/allocate-by-area';
import {
  CreateExpenseData,
  CreateExpenseResult,
  ExpenseWithRelations,
  ReverseExpenseData,
  ReverseExpenseResult,
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
      const seasonIds = [
        ...new Set(
          data.allocations.map((allocation) => allocation.cropSeasonId),
        ),
      ];

      for (const cropSeasonId of seasonIds) {
        await assertActiveCropSeasonLocked(tx, cropSeasonId, data.farmId);
      }

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
        expense: await this.attachCostEntriesForSingleExpense(
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

  private attachCostEntries<
    T extends {
      transactionAllocations: Array<{ id: string }>;
    },
  >(
    expense: T,
    bySourceId: Map<string, Awaited<ReturnType<typeof this.loadCostEntries>>>,
  ): ExpenseWithRelations {
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

  private async loadCostEntries(
    allocationIds: string[],
    prisma:
      | Pick<PrismaService, 'costEntry'>
      | Parameters<Parameters<PrismaService['$transaction']>[0]>[0],
  ) {
    if (allocationIds.length === 0) {
      return [];
    }

    return prisma.costEntry.findMany({
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
  }

  private groupCostEntriesBySourceId(
    costEntries: Awaited<ReturnType<typeof this.loadCostEntries>>,
  ) {
    const bySourceId = new Map<string, typeof costEntries>();
    for (const entry of costEntries) {
      const list = bySourceId.get(entry.sourceId) ?? [];
      list.push(entry);
      bySourceId.set(entry.sourceId, list);
    }
    return bySourceId;
  }

  private async attachCostEntriesForExpenses<
    T extends {
      transactionAllocations: Array<{ id: string }>;
    },
  >(
    expenses: T[],
    prisma:
      | Pick<PrismaService, 'costEntry'>
      | Parameters<Parameters<PrismaService['$transaction']>[0]>[0],
  ): Promise<ExpenseWithRelations[]> {
    const allocationIds = expenses.flatMap((expense) =>
      expense.transactionAllocations.map((allocation) => allocation.id),
    );
    const costEntries = await this.loadCostEntries(allocationIds, prisma);
    const bySourceId = this.groupCostEntriesBySourceId(costEntries);

    return expenses.map((expense) =>
      this.attachCostEntries(expense, bySourceId),
    );
  }

  private async attachCostEntriesForSingleExpense<
    T extends {
      transactionAllocations: Array<{ id: string }>;
    },
  >(
    expense: T,
    prisma:
      | Pick<PrismaService, 'costEntry'>
      | Parameters<Parameters<PrismaService['$transaction']>[0]>[0],
  ): Promise<ExpenseWithRelations> {
    const allocationIds = expense.transactionAllocations.map(
      (allocation) => allocation.id,
    );
    const costEntries = await this.loadCostEntries(allocationIds, prisma);
    const bySourceId = this.groupCostEntriesBySourceId(costEntries);

    return this.attachCostEntries(expense, bySourceId);
  }

  async reverse(data: ReverseExpenseData): Promise<ReverseExpenseResult> {
    return await this.prisma.$transaction(async (tx) => {
      const expense = await tx.transaction.findFirst({
        where: {
          id: data.expenseId,
          farmId: data.farmId,
          type: {
            in: [TransactionType.GENERIC, TransactionType.SALARY_PAYMENT],
          },
        },
        include: {
          transactionAllocations: true,
        },
      });

      if (!expense) {
        throw new NotFoundException('Expense not found');
      }

      const seasonIds = [
        ...new Set(
          expense.transactionAllocations.map(
            (allocation) => allocation.cropSeasonId,
          ),
        ),
      ];

      for (const cropSeasonId of seasonIds) {
        await assertActiveCropSeasonLocked(tx, cropSeasonId, data.farmId);
      }

      const allocationIds = expense.transactionAllocations.map((a) => a.id);
      const costEntries = await this.loadCostEntries(allocationIds, tx);

      if (costEntries.length === 0) {
        throw new ConflictException('Expense has no cost entries to reverse');
      }

      if (costEntries.some((entry) => entry.reversedAt !== null)) {
        throw new ConflictException('Expense has already been reversed');
      }

      for (const entry of costEntries) {
        await tx.costEntry.update({
          where: { id: entry.id },
          data: { reversedAt: data.reversedAt },
        });

        await tx.costEntry.create({
          data: {
            farmId: entry.farmId,
            cropSeasonId: entry.cropSeasonId,
            fieldId: entry.fieldId,
            sourceType: CostEntrySourceType.REVERSAL,
            sourceId: entry.id,
            costCategoryId: entry.costCategoryId,
            amountInCents: -entry.amountInCents,
            date: data.reversedAt,
            reversalOfId: entry.id,
          },
        });
      }

      const reversalNote = `[Estornado em ${data.reversedAt.toISOString()}] ${data.reason}`;
      const updatedNote = expense.note
        ? `${expense.note}\n${reversalNote}`
        : reversalNote;

      await tx.transaction.update({
        where: { id: expense.id },
        data: { note: updatedNote },
      });

      const fullExpense = await tx.transaction.findUniqueOrThrow({
        where: { id: expense.id },
        include: expenseInclude,
      });

      return {
        expense: await this.attachCostEntriesForSingleExpense(fullExpense, tx),
      };
    });
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

    return this.attachCostEntriesForSingleExpense(expense, this.prisma);
  }

  async searchMany(
    query: SearchManyExpensesQuery,
  ): Promise<ExpenseWithRelations[]> {
    const expenses = await this.prisma.transaction.findMany({
      where: {
        farmId: query.farmId,
        type: {
          in:
            query.excludeTypes && query.excludeTypes.length > 0
              ? [
                  TransactionType.GENERIC,
                  TransactionType.SALARY_PAYMENT,
                ].filter((type) => !query.excludeTypes!.includes(type))
              : [TransactionType.GENERIC, TransactionType.SALARY_PAYMENT],
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

    return this.attachCostEntriesForExpenses(expenses, this.prisma);
  }

  async count(query: SearchManyExpensesQuery): Promise<number> {
    return await this.prisma.transaction.count({
      where: {
        farmId: query.farmId,
        type: {
          in:
            query.excludeTypes && query.excludeTypes.length > 0
              ? [
                  TransactionType.GENERIC,
                  TransactionType.SALARY_PAYMENT,
                ].filter((type) => !query.excludeTypes!.includes(type))
              : [TransactionType.GENERIC, TransactionType.SALARY_PAYMENT],
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
