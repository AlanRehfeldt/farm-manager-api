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
import { decimalToString } from 'src/common/serialization/decimal';
import { toExpenseResponse } from '../mappers/expense.mapper';
import {
  EXPENSE_REPOSITORY,
  ExpenseRepository,
} from '../repositories/expense.repository';
import {
  ExpenseAllocationInput,
  ExpenseInstallmentInput,
  PlantingAreaMeta,
} from '../repositories/@types';

type CreateExpenseInput = {
  farmId: string;
  organizationId: string;
  membershipRole: Role;
  type: TransactionType;
  date: Date;
  note?: string | null;
  generic?: { subtype: GenericTransactionSubtype };
  salary?: { employeeId: string };
  installments: ExpenseInstallmentInput[];
  allocations: ExpenseAllocationInput[];
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
    const allocationTotal = input.allocations.reduce(
      (sum, alloc) => sum + BigInt(alloc.allocatedValueInCents),
      0n,
    );

    if (installmentTotal !== allocationTotal) {
      throw new BadRequestException(
        'Installments total must equal allocations total',
      );
    }

    if (
      input.type === TransactionType.SALARY_PAYMENT &&
      input.salary?.employeeId
    ) {
      const employee = await this.employeeRepository.findById(
        input.salary.employeeId,
        input.organizationId,
        input.farmId,
      );
      if (!employee) {
        throw new NotFoundException('Employee not found');
      }
    }

    const plantingAreasBySeason: Record<string, PlantingAreaMeta[]> = {};
    const seasonIdsNeedingPlantings = new Set<string>();

    for (const allocation of input.allocations) {
      await this.validateAllocation(input, allocation);

      if (
        !allocation.fieldId &&
        !plantingAreasBySeason[allocation.cropSeasonId]
      ) {
        seasonIdsNeedingPlantings.add(allocation.cropSeasonId);
      }
    }

    for (const seasonId of seasonIdsNeedingPlantings) {
      const plantings = await this.cropPlantingRepository.findAllBySeason(
        seasonId,
        input.farmId,
      );

      plantingAreasBySeason[seasonId] = plantings.map((planting) => ({
        fieldId: planting.fieldId,
        areaHa:
          decimalToString(planting.plantedAreaHa) ??
          decimalToString(planting.field.areaHa)!,
      }));
    }

    if (
      input.type === TransactionType.SALARY_PAYMENT &&
      input.salary?.employeeId
    ) {
      for (const allocation of input.allocations) {
        const hasOverlap =
          await this.activityRepository.hasEmployeeLaborInSeasonMonth(
            input.salary.employeeId,
            allocation.cropSeasonId,
            input.date.getUTCFullYear(),
            input.date.getUTCMonth() + 1,
          );

        if (hasOverlap) {
          throw domainConflict(
            DomainConflictCode.DOUBLE_COUNT_BLOCKED,
            'Salary allocation blocked: employee already has activity labor in this season and month',
          );
        }
      }
    }

    const { expense } = await this.expenseRepository.create({
      farmId: input.farmId,
      type: input.type,
      date: input.date,
      note: input.note,
      genericSubtype: input.generic?.subtype,
      employeeId: input.salary?.employeeId,
      installments: input.installments,
      allocations: input.allocations,
      plantingAreasBySeason,
    });

    return { expense: toExpenseResponse(expense) };
  }

  private async validateAllocation(
    input: CreateExpenseInput,
    allocation: ExpenseAllocationInput,
  ) {
    if (allocation.allocatedValueInCents <= 0) {
      throw new BadRequestException(
        'Allocation value must be greater than zero',
      );
    }

    const cropSeason = await this.cropSeasonRepository.findById(
      allocation.cropSeasonId,
      input.farmId,
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

    if (allocation.fieldId) {
      const planting = await this.cropPlantingRepository.findBySeasonAndField(
        allocation.cropSeasonId,
        allocation.fieldId,
      );
      if (!planting) {
        throw new BadRequestException(
          'Field is not planted in this crop season',
        );
      }
    }
  }
}
