import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { CropSeasonStatus, Role } from '@prisma/client';
import { CreateExpenseService } from './create-expense.service';
import { ExpenseRepository } from '../repositories/expense.repository';
import { CropSeasonRepository } from 'src/modules/crop-season/repositories/crop-season.repository';
import { CropPlantingRepository } from 'src/modules/crop-season/repositories/crop-planting.repository';
import { CostCenterRepository } from 'src/modules/cost-center/repositories/cost-center.repository';
import { AccountPlanRepository } from 'src/modules/account-plan/repositories/account-plan.repository';
import { CostCategoryRepository } from 'src/modules/cost-category/repositories/cost-category.repository';
import { EmployeeRepository } from 'src/modules/employee/repositories/employee.repository';
import { ActivityRepository } from 'src/modules/activity/repositories/activity.repository';

describe('CreateExpenseService', () => {
  const createExpense = jest.fn();
  const expenseRepository: jest.Mocked<ExpenseRepository> = {
    create: createExpense,
    reverse: jest.fn(),
    findById: jest.fn(),
    searchMany: jest.fn(),
    count: jest.fn(),
  };

  const cropSeasonRepository: jest.Mocked<CropSeasonRepository> = {
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findById: jest.fn(),
    updateStatus: jest.fn(),
    countPlantings: jest.fn(),
    hasOperationalData: jest.fn(),
    countHarvests: jest.fn(),
    searchMany: jest.fn(),
    count: jest.fn(),
  };

  const cropPlantingRepository: jest.Mocked<CropPlantingRepository> = {
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findById: jest.fn(),
    findBySeasonAndField: jest.fn(),
    findAllBySeason: jest.fn(),
    countBySeasonId: jest.fn(),
    hasFieldOperations: jest.fn(),
    searchMany: jest.fn(),
    count: jest.fn(),
  };

  const costCenterRepository: jest.Mocked<CostCenterRepository> = {
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findById: jest.fn(),
    findByCode: jest.fn(),
    searchMany: jest.fn(),
    count: jest.fn(),
  };

  const accountPlanRepository: jest.Mocked<AccountPlanRepository> = {
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findById: jest.fn(),
    findByCode: jest.fn(),
    searchMany: jest.fn(),
    count: jest.fn(),
  };

  const costCategoryRepository: jest.Mocked<CostCategoryRepository> = {
    upsertSeed: jest.fn(),
    findByCode: jest.fn(),
    findById: jest.fn(),
    searchMany: jest.fn(),
    count: jest.fn(),
  };

  const employeeRepository: jest.Mocked<EmployeeRepository> = {
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findById: jest.fn(),
    findByRegistration: jest.fn(),
    searchMany: jest.fn(),
    count: jest.fn(),
  };

  const activityRepository: jest.Mocked<ActivityRepository> = {
    create: jest.fn(),
    reverse: jest.fn(),
    findById: jest.fn(),
    searchMany: jest.fn(),
    count: jest.fn(),
    hasEmployeeLaborInSeasonMonth: jest.fn(),
    hasSalaryAllocationInSeasonMonth: jest.fn(),
  };

  const service = new CreateExpenseService(
    expenseRepository,
    cropSeasonRepository,
    cropPlantingRepository,
    costCenterRepository,
    accountPlanRepository,
    costCategoryRepository,
    employeeRepository,
    activityRepository,
  );

  const baseInput = {
    farmId: 'farm-1',
    organizationId: 'org-1',
    membershipRole: Role.ADMIN,
    type: 'GENERIC' as const,
    date: new Date('2026-08-15T12:00:00.000Z'),
    generic: { subtype: 'SERVICE_PAYMENT' as const },
    installments: [
      {
        valueInCents: 500000,
        dueDate: new Date('2026-08-20'),
        paymentForm: 'PIX' as const,
      },
    ],
    allocations: [
      {
        costCenterId: 'cc-1',
        accountPlanId: 'ap-1',
        costCategoryId: 'cat-1',
        cropSeasonId: 'season-1',
        allocatedValueInCents: 500000,
      },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    cropSeasonRepository.findById.mockResolvedValue({
      id: 'season-1',
      status: CropSeasonStatus.ACTIVE,
    } as never);
    costCenterRepository.findById.mockResolvedValue({ id: 'cc-1' } as never);
    accountPlanRepository.findById.mockResolvedValue({ id: 'ap-1' } as never);
    costCategoryRepository.searchMany.mockResolvedValue([
      { id: 'cat-1' },
    ] as never);
    cropPlantingRepository.findAllBySeason.mockResolvedValue([
      {
        fieldId: 'field-a',
        plantedAreaHa: { toString: () => '2' },
        field: { areaHa: { toString: () => '2' } },
      },
      {
        fieldId: 'field-b',
        plantedAreaHa: null,
        field: { areaHa: { toString: () => '1' } },
      },
    ] as never);
    createExpense.mockResolvedValue({
      expense: {
        id: 'expense-1',
        farmId: 'farm-1',
        type: 'GENERIC',
        date: baseInput.date,
        note: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        installments: [],
        transactionAllocations: [],
        salaryTransaction: null,
        genericDetails: { subtype: 'SERVICE_PAYMENT' },
      },
    });
  });

  it('creates generic expense with season allocation and area split metadata', async () => {
    await service.execute(baseInput);

    expect(createExpense).toHaveBeenCalledWith(
      expect.objectContaining({
        farmId: 'farm-1',
        type: 'GENERIC',
        plantingAreasBySeason: {
          'season-1': [
            { fieldId: 'field-a', areaHa: '2' },
            { fieldId: 'field-b', areaHa: '1' },
          ],
        },
      }),
    );
  });

  it('throws when installments total differs from allocations total', async () => {
    await expect(
      service.execute({
        ...baseInput,
        installments: [
          {
            valueInCents: 100,
            dueDate: new Date('2026-08-20'),
            paymentForm: 'PIX',
          },
        ],
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('throws when crop season is not active', async () => {
    cropSeasonRepository.findById.mockResolvedValue({
      id: 'season-1',
      status: CropSeasonStatus.CLOSED,
    } as never);

    await expect(service.execute(baseInput)).rejects.toThrow(ConflictException);
  });

  it('blocks salary when employee already has activity labor (DC-02)', async () => {
    employeeRepository.findById.mockResolvedValue({ id: 'emp-1' } as never);
    activityRepository.hasEmployeeLaborInSeasonMonth.mockResolvedValue(true);

    await expect(
      service.execute({
        ...baseInput,
        type: 'SALARY_PAYMENT',
        salary: { employeeId: 'emp-1' },
        generic: undefined,
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('throws when field is not planted in season', async () => {
    cropPlantingRepository.findBySeasonAndField.mockResolvedValue(null);

    await expect(
      service.execute({
        ...baseInput,
        allocations: [
          {
            ...baseInput.allocations[0],
            fieldId: 'field-x',
          },
        ],
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('throws when cost center is missing', async () => {
    costCenterRepository.findById.mockResolvedValue(null);

    await expect(service.execute(baseInput)).rejects.toThrow(NotFoundException);
  });
});
