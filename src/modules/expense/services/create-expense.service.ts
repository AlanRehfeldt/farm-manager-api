import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  DomainConflictCode,
  domainConflict,
} from 'src/common/errors/domain-conflict';
import {
  CropSeasonStatus,
  GenericTransactionSubtype,
  Role,
  TransactionType,
} from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/client';
import {
  ACCOUNT_PLAN_REPOSITORY,
  AccountPlanRepository,
} from 'src/modules/account-plan/repositories/account-plan.repository';
import {
  ACTIVITY_REPOSITORY,
  ActivityRepository,
} from 'src/modules/activity/repositories/activity.repository';
import {
  COST_CATEGORY_REPOSITORY,
  CostCategoryRepository,
} from 'src/modules/cost-category/repositories/cost-category.repository';
import {
  COST_CENTER_REPOSITORY,
  CostCenterRepository,
} from 'src/modules/cost-center/repositories/cost-center.repository';
import {
  CROP_PLANTING_REPOSITORY,
  CropPlantingRepository,
} from 'src/modules/crop-season/repositories/crop-planting.repository';
import {
  CROP_SEASON_REPOSITORY,
  CropSeasonRepository,
} from 'src/modules/crop-season/repositories/crop-season.repository';
import {
  EMPLOYEE_REPOSITORY,
  EmployeeRepository,
} from 'src/modules/employee/repositories/employee.repository';
import {
  FARM_REPOSITORY,
  FarmRepository,
} from 'src/modules/farm/repositories/farm.repository';
import { decimalToString } from 'src/common/serialization/decimal';
import { allocateByArea } from '../domain/allocate-by-area';
import { toExpenseResponse } from '../mappers/expense.mapper';
import {
  EXPENSE_REPOSITORY,
  ExpenseRepository,
} from '../repositories/expense.repository';
import {
  ExpenseAllocationInput,
  ExpenseInstallmentInput,
  ResolvedExpenseAllocation,
} from '../repositories/@types';

type CreateExpenseInput = {
  payerFarmId: string;
  organizationId: string;
  userId: string;
  membershipRole: Role;
  type: TransactionType;
  date: Date;
  note?: string | null;
  generic?: { subtype: GenericTransactionSubtype };
  salary?: { employeeId: string };
  installments: ExpenseInstallmentInput[];
  allocations: ExpenseAllocationInput[];
};

function allocationPoolKey(
  allocationIndex: number,
  cropSeasonId: string,
  fieldId: string,
): string {
  return `${allocationIndex}:${cropSeasonId}:${fieldId}`;
}

type DestinationField = {
  allocationIndex: number;
  farmId: string;
  cropSeasonId: string;
  fieldId: string;
  areaHa: Decimal;
  costCenterId: string;
  accountPlanId: string;
  costCategoryId: string;
};

@Injectable()
export class CreateExpenseService {
  constructor(
    @Inject(EXPENSE_REPOSITORY)
    private readonly expenseRepository: ExpenseRepository,
    @Inject(CROP_SEASON_REPOSITORY)
    private readonly cropSeasonRepository: CropSeasonRepository,
    @Inject(CROP_PLANTING_REPOSITORY)
    private readonly cropPlantingRepository: CropPlantingRepository,
    @Inject(COST_CENTER_REPOSITORY)
    private readonly costCenterRepository: CostCenterRepository,
    @Inject(ACCOUNT_PLAN_REPOSITORY)
    private readonly accountPlanRepository: AccountPlanRepository,
    @Inject(COST_CATEGORY_REPOSITORY)
    private readonly costCategoryRepository: CostCategoryRepository,
    @Inject(EMPLOYEE_REPOSITORY)
    private readonly employeeRepository: EmployeeRepository,
    @Inject(ACTIVITY_REPOSITORY)
    private readonly activityRepository: ActivityRepository,
    @Inject(FARM_REPOSITORY)
    private readonly farmRepository: FarmRepository,
  ) {}

  async execute(input: CreateExpenseInput) {
    if (input.allocations.length === 0) {
      throw new BadRequestException(
        'Expense must have at least one allocation',
      );
    }

    if (input.installments.length === 0) {
      throw new BadRequestException(
        'Expense must have at least one installment',
      );
    }

    if (input.type === TransactionType.GENERIC && !input.generic?.subtype) {
      throw new BadRequestException('Generic expense requires subtype');
    }

    if (
      input.type === TransactionType.SALARY_PAYMENT &&
      !input.salary?.employeeId
    ) {
      throw new BadRequestException('Salary payment requires employeeId');
    }

    if (
      input.type === TransactionType.SALARY_PAYMENT &&
      input.membershipRole !== Role.ADMIN
    ) {
      throw new ForbiddenException('Salary payments require farm admin access');
    }

    const installmentTotal = input.installments.reduce(
      (sum, inst) => sum + BigInt(inst.valueInCents),
      0n,
    );

    const withValue = input.allocations.filter(
      (a) => a.allocatedValueInCents !== undefined,
    );
    const withoutValue = input.allocations.filter(
      (a) => a.allocatedValueInCents === undefined,
    );

    if (withValue.length > 0 && withoutValue.length > 0) {
      throw new BadRequestException(
        'Cannot mix allocations with and without allocatedValueInCents',
      );
    }

    const isCompatMode = withValue.length === input.allocations.length;

    if (isCompatMode) {
      const allocationTotal = input.allocations.reduce(
        (sum, alloc) => sum + BigInt(alloc.allocatedValueInCents!),
        0n,
      );
      if (installmentTotal !== allocationTotal) {
        throw new BadRequestException(
          'Installments total must equal allocations total',
        );
      }
    }

    if (
      input.type === TransactionType.SALARY_PAYMENT &&
      input.salary?.employeeId
    ) {
      const employee = await this.employeeRepository.findById(
        input.salary.employeeId,
        input.organizationId,
        input.payerFarmId,
      );
      if (!employee) {
        throw new NotFoundException('Employee not found');
      }
    }

    const resolvedDestinations: DestinationField[][] = [];

    for (let i = 0; i < input.allocations.length; i++) {
      const fields = await this.resolveAllocationDestinations(
        input,
        input.allocations[i],
        i,
      );
      resolvedDestinations.push(fields);
    }

    this.assertNoDuplicateFields(resolvedDestinations.flat());

    let resolvedAllocations: ResolvedExpenseAllocation[];

    if (isCompatMode) {
      resolvedAllocations = [];
      for (let i = 0; i < input.allocations.length; i++) {
        const allocation = input.allocations[i];
        const fields = resolvedDestinations[i];
        const amount = BigInt(allocation.allocatedValueInCents!);
        resolvedAllocations.push(
          this.buildResolvedAllocation(allocation, fields, amount),
        );
      }
    } else {
      const allFields = resolvedDestinations.flat();
      if (allFields.length === 0) {
        throw new BadRequestException(
          'No fields to allocate; select at least one planted field',
        );
      }

      const splits = allocateByArea(
        installmentTotal,
        allFields.map((f) => ({
          fieldId: allocationPoolKey(
            f.allocationIndex,
            f.cropSeasonId,
            f.fieldId,
          ),
          areaHa: f.areaHa,
        })),
      );
      const amountByPoolKey = new Map(
        splits.map((s) => [s.fieldId, s.amountInCents]),
      );

      resolvedAllocations = [];
      for (let i = 0; i < input.allocations.length; i++) {
        const allocation = input.allocations[i];
        const fields = resolvedDestinations[i];
        const seasonTotal = fields.reduce(
          (sum, f) =>
            sum +
            (amountByPoolKey.get(
              allocationPoolKey(f.allocationIndex, f.cropSeasonId, f.fieldId),
            ) ?? 0n),
          0n,
        );
        resolvedAllocations.push(
          this.buildResolvedAllocationFromSplits(
            allocation,
            fields,
            amountByPoolKey,
            seasonTotal,
          ),
        );
      }
    }

    if (
      input.type === TransactionType.SALARY_PAYMENT &&
      input.salary?.employeeId
    ) {
      const year = input.date.getUTCFullYear();
      const month = input.date.getUTCMonth() + 1;

      const monthClosed =
        await this.activityRepository.hasLaborMonthClosing(
          input.salary.employeeId,
          year,
          month,
        );
      if (monthClosed) {
        throw domainConflict(
          DomainConflictCode.DOUBLE_COUNT_BLOCKED,
          'Salary allocation blocked: labor month is already closed for this employee',
        );
      }

      const hasOverlap =
        await this.activityRepository.hasEmployeeLaborInOrgMonth(
          input.salary.employeeId,
          input.organizationId,
          year,
          month,
        );

      if (hasOverlap) {
        throw domainConflict(
          DomainConflictCode.DOUBLE_COUNT_BLOCKED,
          'Salary allocation blocked: employee already has activity labor in this month',
        );
      }
    }

    const { expense } = await this.expenseRepository.create({
      farmId: input.payerFarmId,
      type: input.type,
      date: input.date,
      note: input.note,
      genericSubtype: input.generic?.subtype,
      employeeId: input.salary?.employeeId,
      installments: input.installments,
      allocations: resolvedAllocations,
    });

    return { expense: toExpenseResponse(expense) };
  }

  private buildResolvedAllocation(
    allocation: ExpenseAllocationInput,
    fields: DestinationField[],
    amount: bigint,
  ): ResolvedExpenseAllocation {
    const destinationFarmId = fields[0].farmId;
    const cropSeasonId = fields[0].cropSeasonId;

    if (fields.length === 1) {
      return {
        farmId: destinationFarmId,
        costCenterId: allocation.costCenterId,
        accountPlanId: allocation.accountPlanId,
        costCategoryId: allocation.costCategoryId,
        cropSeasonId,
        fieldId: fields[0].fieldId,
        allocatedValueInCents: amount,
        costEntries: [
          {
            farmId: destinationFarmId,
            cropSeasonId,
            fieldId: fields[0].fieldId,
            amountInCents: amount,
            costCategoryId: allocation.costCategoryId,
          },
        ],
      };
    }

    const splits = allocateByArea(
      amount,
      fields.map((f) => ({ fieldId: f.fieldId, areaHa: f.areaHa })),
    );

    return {
      farmId: destinationFarmId,
      costCenterId: allocation.costCenterId,
      accountPlanId: allocation.accountPlanId,
      costCategoryId: allocation.costCategoryId,
      cropSeasonId,
      fieldId: null,
      allocatedValueInCents: amount,
      costEntries: splits.map((split) => ({
        farmId: destinationFarmId,
        cropSeasonId,
        fieldId: split.fieldId,
        amountInCents: split.amountInCents,
        costCategoryId: allocation.costCategoryId,
      })),
    };
  }

  private buildResolvedAllocationFromSplits(
    allocation: ExpenseAllocationInput,
    fields: DestinationField[],
    amountByField: Map<string, bigint>,
    seasonTotal: bigint,
  ): ResolvedExpenseAllocation {
    const destinationFarmId = fields[0].farmId;
    const cropSeasonId = fields[0].cropSeasonId;

    return {
      farmId: destinationFarmId,
      costCenterId: allocation.costCenterId,
      accountPlanId: allocation.accountPlanId,
      costCategoryId: allocation.costCategoryId,
      cropSeasonId,
      fieldId: fields.length === 1 ? fields[0].fieldId : null,
      allocatedValueInCents: seasonTotal,
      costEntries: fields.map((f) => ({
        farmId: f.farmId,
        cropSeasonId: f.cropSeasonId,
        fieldId: f.fieldId,
        amountInCents:
          amountByField.get(
            allocationPoolKey(f.allocationIndex, f.cropSeasonId, f.fieldId),
          ) ?? 0n,
        costCategoryId: allocation.costCategoryId,
      })),
    };
  }

  private assertNoDuplicateFields(fields: DestinationField[]) {
    const seen = new Set<string>();
    for (const field of fields) {
      const key = [
        field.cropSeasonId,
        field.fieldId,
        field.costCenterId,
        field.accountPlanId,
        field.costCategoryId,
      ].join(':');
      if (seen.has(key)) {
        throw new BadRequestException(
          'Duplicate field across allocation destinations',
        );
      }
      seen.add(key);
    }
  }

  private async resolveAllocationDestinations(
    input: CreateExpenseInput,
    allocation: ExpenseAllocationInput,
    allocationIndex: number,
  ): Promise<DestinationField[]> {
    if (
      allocation.fieldId &&
      allocation.fieldIds &&
      allocation.fieldIds.length > 0
    ) {
      throw new BadRequestException(
        'Cannot combine fieldId and fieldIds on the same allocation',
      );
    }

    const destinationFarmId = allocation.farmId ?? input.payerFarmId;

    if (destinationFarmId !== input.payerFarmId) {
      const accessible = await this.farmRepository.findAccessibleByUser(
        destinationFarmId,
        input.userId,
      );
      if (!accessible) {
        throw new NotFoundException('Farm not found');
      }
      if (accessible.organizationId !== input.organizationId) {
        throw new NotFoundException('Farm not found');
      }
    }

    const cropSeason = await this.cropSeasonRepository.findById(
      allocation.cropSeasonId,
      destinationFarmId,
    );
    if (!cropSeason) {
      throw new NotFoundException('Crop season not found');
    }
    if (cropSeason.status !== CropSeasonStatus.ACTIVE) {
      throw new ConflictException('Allocations require an active crop season');
    }

    const costCenter = await this.costCenterRepository.findById(
      allocation.costCenterId,
      input.organizationId,
    );
    if (!costCenter) {
      throw new NotFoundException('Cost center not found');
    }

    const accountPlan = await this.accountPlanRepository.findById(
      allocation.accountPlanId,
      input.organizationId,
    );
    if (!accountPlan) {
      throw new NotFoundException('Account plan not found');
    }

    const categories = await this.costCategoryRepository.searchMany({
      organizationId: input.organizationId,
      id: allocation.costCategoryId,
      page: 1,
      perPage: 1,
      orderBy: 'name',
      orderDirection: 'asc',
    });
    if (categories.length === 0) {
      throw new NotFoundException('Cost category not found');
    }

    const plantings = await this.cropPlantingRepository.findAllBySeason(
      allocation.cropSeasonId,
      destinationFarmId,
    );

    let selectedFieldIds: string[];

    if (allocation.fieldId) {
      const planting = plantings.find((p) => p.fieldId === allocation.fieldId);
      if (!planting) {
        throw new BadRequestException(
          'Field is not planted in this crop season',
        );
      }
      selectedFieldIds = [allocation.fieldId];
    } else if (allocation.fieldIds && allocation.fieldIds.length > 0) {
      selectedFieldIds = [...new Set(allocation.fieldIds)];
      for (const fieldId of selectedFieldIds) {
        if (!plantings.some((p) => p.fieldId === fieldId)) {
          throw new BadRequestException(
            'Field is not planted in this crop season',
          );
        }
      }
    } else {
      selectedFieldIds = plantings.map((p) => p.fieldId);
    }

    if (selectedFieldIds.length === 0) {
      throw new BadRequestException(
        'Crop season has no planted fields to allocate',
      );
    }

    const destinations: DestinationField[] = [];

    for (const fieldId of selectedFieldIds) {
      const planting = plantings.find((p) => p.fieldId === fieldId)!;
      const areaHaStr =
        decimalToString(planting.plantedAreaHa) ??
        decimalToString(planting.field.areaHa);
      if (!areaHaStr) {
        throw new BadRequestException('Field area must be positive');
      }
      const areaHa = new Decimal(areaHaStr);
      if (areaHa.lte(0)) {
        throw new BadRequestException('Field area must be positive');
      }

      destinations.push({
        allocationIndex,
        farmId: destinationFarmId,
        cropSeasonId: allocation.cropSeasonId,
        fieldId,
        areaHa,
        costCenterId: allocation.costCenterId,
        accountPlanId: allocation.accountPlanId,
        costCategoryId: allocation.costCategoryId,
      });
    }

    return destinations;
  }
}
