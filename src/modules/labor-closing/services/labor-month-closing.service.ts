import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { Decimal } from '@prisma/client/runtime/library';
import {
  DomainConflictCode,
  domainConflict,
} from 'src/common/errors/domain-conflict';
import { bigintToNumber } from 'src/common/serialization/money';
import { decimalToString } from 'src/common/serialization/decimal';
import {
  COST_CATEGORY_REPOSITORY,
  CostCategoryRepository,
} from 'src/modules/cost-category/repositories/cost-category.repository';
import { allocateLaborByHours } from '../domain/allocate-labor-by-hours';
import {
  CloseEmployeeLaborData,
  OpenCltLaborLine,
} from '../repositories/@types';
import {
  LABOR_CLOSING_REPOSITORY,
  LaborClosingRepository,
} from '../repositories/labor-closing.repository';

export type LaborClosingPreviewEmployee = {
  employeeId: string;
  employeeName: string;
  salaryInCents: number;
  totalHours: string;
  hourlyCostInCents: number;
  lineCount: number;
};

export type LaborClosingPreviewResult = {
  year: number;
  month: number;
  employees: LaborClosingPreviewEmployee[];
};

export type LaborClosingCloseResult = {
  year: number;
  month: number;
  closedCount: number;
  employees: Array<{
    employeeId: string;
    employeeName: string;
    salaryInCents: number;
    totalHours: string;
    closingId: string;
  }>;
};

function groupByEmployee(
  lines: OpenCltLaborLine[],
): Map<string, OpenCltLaborLine[]> {
  const map = new Map<string, OpenCltLaborLine[]>();
  for (const line of lines) {
    const existing = map.get(line.employeeId) ?? [];
    existing.push(line);
    map.set(line.employeeId, existing);
  }
  return map;
}

@Injectable()
export class PreviewLaborMonthClosingService {
  constructor(
    @Inject(LABOR_CLOSING_REPOSITORY)
    private readonly laborClosingRepository: LaborClosingRepository,
  ) {}

  async execute(
    organizationId: string,
    year: number,
    month: number,
  ): Promise<LaborClosingPreviewResult> {
    if (month < 1 || month > 12) {
      throw new BadRequestException('month must be between 1 and 12');
    }

    const lines =
      await this.laborClosingRepository.findOpenCltLaborInOrgMonth(
        organizationId,
        year,
        month,
      );

    const byEmployee = groupByEmployee(lines);
    const employees: LaborClosingPreviewEmployee[] = [];

    for (const [employeeId, employeeLines] of byEmployee) {
      const salaryInCents = employeeLines[0].monthlySalaryInCents;
      const totalHours = employeeLines.reduce(
        (sum, line) => sum.plus(line.hours),
        new Decimal(0),
      );
      const hourlyCost = totalHours.gt(0)
        ? BigInt(
            new Decimal(salaryInCents.toString())
              .div(totalHours)
              .toDecimalPlaces(0, Decimal.ROUND_HALF_UP)
              .toFixed(0),
          )
        : 0n;

      employees.push({
        employeeId,
        employeeName: employeeLines[0].employeeName,
        salaryInCents: bigintToNumber(salaryInCents)!,
        totalHours: decimalToString(totalHours)!,
        hourlyCostInCents: bigintToNumber(hourlyCost)!,
        lineCount: employeeLines.length,
      });
    }

    employees.sort((a, b) => a.employeeName.localeCompare(b.employeeName));

    return { year, month, employees };
  }
}

@Injectable()
export class CloseLaborMonthService {
  constructor(
    @Inject(LABOR_CLOSING_REPOSITORY)
    private readonly laborClosingRepository: LaborClosingRepository,
    @Inject(COST_CATEGORY_REPOSITORY)
    private readonly costCategoryRepository: CostCategoryRepository,
  ) {}

  async execute(input: {
    organizationId: string;
    year: number;
    month: number;
    closedByUserId: string;
  }): Promise<LaborClosingCloseResult> {
    const { organizationId, year, month, closedByUserId } = input;

    if (month < 1 || month > 12) {
      throw new BadRequestException('month must be between 1 and 12');
    }

    const moFixa = await this.costCategoryRepository.findByCode(
      organizationId,
      'MO_fixa',
    );
    if (!moFixa) {
      throw new BadRequestException(
        'Required cost category MO_fixa not found for organization',
      );
    }

    const lines =
      await this.laborClosingRepository.findOpenCltLaborInOrgMonth(
        organizationId,
        year,
        month,
      );

    if (lines.length === 0) {
      throw new ConflictException(
        'No open CLT labor hours to close for this month',
      );
    }

    const byEmployee = groupByEmployee(lines);
    const closed: LaborClosingCloseResult['employees'] = [];
    const toClose: CloseEmployeeLaborData[] = [];

    for (const [employeeId, employeeLines] of byEmployee) {
      const existing = await this.laborClosingRepository.findClosing(
        employeeId,
        year,
        month,
      );
      if (existing) {
        throw new ConflictException(
          `Labor month already closed for employee ${employeeLines[0].employeeName}`,
        );
      }

      const salaryInCents = employeeLines[0].monthlySalaryInCents;
      if (salaryInCents <= 0n) {
        throw new BadRequestException(
          `CLT employee ${employeeLines[0].employeeName} has no monthly salary`,
        );
      }

      const hasSalary =
        await this.laborClosingRepository.hasSalaryAllocationInOrgMonth(
          employeeId,
          organizationId,
          year,
          month,
        );
      if (hasSalary) {
        throw domainConflict(
          DomainConflictCode.DOUBLE_COUNT_BLOCKED,
          `Cannot close labor month: employee ${employeeLines[0].employeeName} already has salary allocated`,
        );
      }

      const totalHours = employeeLines.reduce(
        (sum, line) => sum.plus(line.hours),
        new Decimal(0),
      );

      const allocations = allocateLaborByHours(
        salaryInCents,
        employeeLines.map((line) => ({
          activityLaborId: line.activityLaborId,
          hours: line.hours,
        })),
      );

      const allocationById = new Map(
        allocations.map((a) => [a.activityLaborId, a.amountInCents]),
      );

      toClose.push({
        organizationId,
        employeeId,
        year,
        month,
        salaryInCents,
        totalHours,
        closedByUserId,
        moFixaCostCategoryId: moFixa.id,
        allocations: employeeLines.map((line) => ({
          activityLaborId: line.activityLaborId,
          amountInCents: allocationById.get(line.activityLaborId)!,
          farmId: line.farmId,
          cropSeasonId: line.cropSeasonId,
          fieldId: line.fieldId,
          activityId: line.activityId,
          activityDate: line.activityDate,
        })),
      });

      closed.push({
        employeeId,
        employeeName: employeeLines[0].employeeName,
        salaryInCents: bigintToNumber(salaryInCents)!,
        totalHours: decimalToString(totalHours)!,
        closingId: '', // filled after TX
      });
    }

    const closings =
      await this.laborClosingRepository.closeOrgMonth(toClose);

    const closingByEmployee = new Map(
      closings.map((c) => [c.employeeId, c.id]),
    );

    for (const entry of closed) {
      entry.closingId = closingByEmployee.get(entry.employeeId)!;
    }

    return {
      year,
      month,
      closedCount: closed.length,
      employees: closed,
    };
  }
}
