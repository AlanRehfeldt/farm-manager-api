import { ConflictException, Injectable } from '@nestjs/common';
import {
  CostEntrySourceType,
  CropSeasonStatus,
  EmploymentType,
  Prisma,
  TransactionType,
} from '@prisma/client';
import {
  DomainConflictCode,
  domainConflict,
} from 'src/common/errors/domain-conflict';
import { assertActiveCropSeasonLocked } from 'src/common/prisma/crop-season-lock';
import { PrismaService } from 'src/common/prisma/prisma.service';
import {
  CloseEmployeeLaborData,
  LaborMonthClosingRecord,
  OpenCltLaborLine,
} from './@types';
import { LaborClosingRepository } from './labor-closing.repository';

function isActivityFullyReversed(
  costEntries: { sourceType: CostEntrySourceType; reversedAt: Date | null }[],
): boolean {
  const original = costEntries.filter(
    (entry) => entry.sourceType !== CostEntrySourceType.REVERSAL,
  );

  return (
    original.length > 0 && original.every((entry) => entry.reversedAt != null)
  );
}

function toClosingRecord(
  closing: LaborMonthClosingRecord,
): LaborMonthClosingRecord {
  return {
    id: closing.id,
    organizationId: closing.organizationId,
    employeeId: closing.employeeId,
    year: closing.year,
    month: closing.month,
    salaryInCents: closing.salaryInCents,
    totalHours: closing.totalHours,
    closedByUserId: closing.closedByUserId,
    closedAt: closing.closedAt,
  };
}

@Injectable()
export class PrismaLaborClosingRepository implements LaborClosingRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findOpenCltLaborInOrgMonth(
    organizationId: string,
    year: number,
    month: number,
  ): Promise<OpenCltLaborLine[]> {
    const start = new Date(Date.UTC(year, month - 1, 1));
    const end = new Date(Date.UTC(year, month, 1));

    const rows = await this.prisma.activityLabor.findMany({
      where: {
        costInCents: null,
        employeeId: { not: null },
        hours: { not: null },
        employee: {
          employmentType: EmploymentType.CLT,
          organizationId,
        },
        activity: {
          date: { gte: start, lt: end },
          farm: { organizationId },
          cropSeason: { status: CropSeasonStatus.ACTIVE },
        },
      },
      include: {
        employee: {
          select: {
            id: true,
            name: true,
            monthlySalaryInCents: true,
          },
        },
        activity: {
          select: {
            id: true,
            date: true,
            farmId: true,
            cropSeasonId: true,
            fieldId: true,
            costEntries: {
              select: { sourceType: true, reversedAt: true },
            },
          },
        },
      },
    });

    return rows
      .filter(
        (row) =>
          row.employee != null &&
          row.hours != null &&
          !isActivityFullyReversed(row.activity.costEntries),
      )
      .map((row) => ({
        activityLaborId: row.id,
        employeeId: row.employee!.id,
        employeeName: row.employee!.name,
        hours: row.hours!,
        activityId: row.activity.id,
        activityDate: row.activity.date,
        farmId: row.activity.farmId,
        cropSeasonId: row.activity.cropSeasonId,
        fieldId: row.activity.fieldId,
        monthlySalaryInCents: row.employee!.monthlySalaryInCents ?? 0n,
      }));
  }

  async findOpenCltLaborMonthsForSeason(
    cropSeasonId: string,
  ): Promise<{ year: number; month: number }[]> {
    const rows = await this.prisma.activityLabor.findMany({
      where: {
        costInCents: null,
        employeeId: { not: null },
        hours: { not: null },
        employee: {
          employmentType: EmploymentType.CLT,
        },
        activity: {
          cropSeasonId,
        },
      },
      select: {
        activity: {
          select: {
            date: true,
            costEntries: {
              select: { sourceType: true, reversedAt: true },
            },
          },
        },
      },
    });

    const seen = new Set<string>();
    const result: { year: number; month: number }[] = [];

    for (const row of rows) {
      if (isActivityFullyReversed(row.activity.costEntries)) {
        continue;
      }
      const year = row.activity.date.getUTCFullYear();
      const month = row.activity.date.getUTCMonth() + 1;
      const key = `${year}-${month}`;
      if (!seen.has(key)) {
        seen.add(key);
        result.push({ year, month });
      }
    }

    return result.sort((a, b) =>
      a.year !== b.year ? a.year - b.year : a.month - b.month,
    );
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
          date: { gte: start, lt: end },
          farm: { organizationId },
          salaryTransaction: { employeeId },
        },
      },
    });

    return count > 0;
  }

  async findClosing(
    employeeId: string,
    year: number,
    month: number,
  ): Promise<LaborMonthClosingRecord | null> {
    const closing = await this.prisma.laborMonthClosing.findUnique({
      where: {
        employeeId_year_month: { employeeId, year, month },
      },
    });

    if (!closing) {
      return null;
    }

    return toClosingRecord(closing);
  }

  async closeOrgMonth(
    employees: CloseEmployeeLaborData[],
  ): Promise<LaborMonthClosingRecord[]> {
    try {
      return await this.prisma.$transaction(async (tx) => {
        const lockKeys = [
          ...new Map(
            employees.flatMap((employee) =>
              employee.allocations.map((allocation) => [
                `${allocation.farmId}:${allocation.cropSeasonId}`,
                {
                  farmId: allocation.farmId,
                  cropSeasonId: allocation.cropSeasonId,
                },
              ]),
            ),
          ).values(),
        ].sort((a, b) =>
          a.cropSeasonId !== b.cropSeasonId
            ? a.cropSeasonId.localeCompare(b.cropSeasonId)
            : a.farmId.localeCompare(b.farmId),
        );

        for (const lock of lockKeys) {
          await assertActiveCropSeasonLocked(
            tx,
            lock.cropSeasonId,
            lock.farmId,
          );
        }

        const closings: LaborMonthClosingRecord[] = [];

        for (const data of employees) {
          const existing = await tx.laborMonthClosing.findUnique({
            where: {
              employeeId_year_month: {
                employeeId: data.employeeId,
                year: data.year,
                month: data.month,
              },
            },
          });
          if (existing) {
            throw new ConflictException(
              'Labor month already closed for this competence',
            );
          }

          const start = new Date(Date.UTC(data.year, data.month - 1, 1));
          const end = new Date(Date.UTC(data.year, data.month, 1));
          const salaryCount = await tx.transactionAllocation.count({
            where: {
              transaction: {
                type: TransactionType.SALARY_PAYMENT,
                date: { gte: start, lt: end },
                farm: { organizationId: data.organizationId },
                salaryTransaction: { employeeId: data.employeeId },
              },
            },
          });
          if (salaryCount > 0) {
            throw domainConflict(
              DomainConflictCode.DOUBLE_COUNT_BLOCKED,
              'Cannot close labor month: employee already has salary allocated',
            );
          }

          for (const allocation of data.allocations) {
            await tx.activityLabor.update({
              where: { id: allocation.activityLaborId },
              data: { costInCents: allocation.amountInCents },
            });

            await tx.costEntry.create({
              data: {
                farmId: allocation.farmId,
                cropSeasonId: allocation.cropSeasonId,
                fieldId: allocation.fieldId,
                activityId: allocation.activityId,
                sourceType: CostEntrySourceType.ACTIVITY_LABOR,
                sourceId: allocation.activityLaborId,
                costCategoryId: data.moFixaCostCategoryId,
                amountInCents: allocation.amountInCents,
                date: allocation.activityDate,
              },
            });
          }

          const closing = await tx.laborMonthClosing.create({
            data: {
              organizationId: data.organizationId,
              employeeId: data.employeeId,
              year: data.year,
              month: data.month,
              salaryInCents: data.salaryInCents,
              totalHours: data.totalHours,
              closedByUserId: data.closedByUserId,
            },
          });

          closings.push(toClosingRecord(closing));
        }

        return closings;
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          'Labor month already closed for this competence',
        );
      }
      throw error;
    }
  }
}
