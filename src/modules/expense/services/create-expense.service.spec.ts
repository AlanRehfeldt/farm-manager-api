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
import { FarmRepository } from 'src/modules/farm/repositories/farm.repository';
import { CreateExpenseData, CreateExpenseResult } from '../repositories/@types';

describe('CreateExpenseService', () => {
  const createExpense = jest.fn<
    Promise<CreateExpenseResult>,
    [CreateExpenseData]
  >();
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
    hasEmployeeLaborInOrgMonth: jest.fn(),
    hasSalaryAllocationInOrgMonth: jest.fn(),
    hasLaborMonthClosing: jest.fn(),
  };

  const findAccessibleByUser = jest.fn<
    ReturnType<FarmRepository['findAccessibleByUser']>,
    Parameters<FarmRepository['findAccessibleByUser']>
  >();

  const farmRepository: jest.Mocked<FarmRepository> = {
    create: jest.fn(),
    update: jest.fn(),
    findById: jest.fn(),
    findByOrganizationAndName: jest.fn(),
    findAccessibleByUser,
    searchAccessibleByUser: jest.fn(),
    countAccessibleByUser: jest.fn(),
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
    farmRepository,
  );

  const baseInput = {
    payerFarmId: 'farm-1',
    organizationId: 'org-1',
    userId: 'user-1',
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

  const plantingsFarm1 = [
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
  ];

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
    cropPlantingRepository.findAllBySeason.mockResolvedValue(
      plantingsFarm1 as never,
    );
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
    } as unknown as CreateExpenseResult);
  });

  it('creates generic expense with season allocation and area split (compat)', async () => {
    await service.execute(baseInput);

    const payload = createExpense.mock.calls[0][0];
    expect(payload.farmId).toBe('farm-1');
    expect(payload.type).toBe('GENERIC');
    expect(payload.allocations[0]).toEqual(
      expect.objectContaining({
        farmId: 'farm-1',
        cropSeasonId: 'season-1',
        fieldId: null,
        allocatedValueInCents: 500000n,
      }),
    );
    expect(payload.allocations[0].costEntries).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          fieldId: 'field-a',
          amountInCents: 333333n,
          farmId: 'farm-1',
        }),
        expect.objectContaining({
          fieldId: 'field-b',
          amountInCents: 166667n,
          farmId: 'farm-1',
        }),
      ]),
    );
  });

  it('throws when installments total differs from allocations total (compat)', async () => {
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
    activityRepository.hasEmployeeLaborInOrgMonth.mockResolvedValue(true);

    await expect(
      service.execute({
        ...baseInput,
        type: 'SALARY_PAYMENT',
        salary: { employeeId: 'emp-1' },
        generic: undefined,
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('blocks salary when the labor month is already closed (DC-02)', async () => {
    employeeRepository.findById.mockResolvedValue({ id: 'emp-1' } as never);
    activityRepository.hasLaborMonthClosing.mockResolvedValue(true);

    await expect(
      service.execute({
        ...baseInput,
        type: 'SALARY_PAYMENT',
        salary: { employeeId: 'emp-1' },
        generic: undefined,
      }),
    ).rejects.toThrow(ConflictException);
    expect(expenseRepository.create).not.toHaveBeenCalled();
  });

  it('throws when field is not planted in season', async () => {
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

  it('rejects mixing allocations with and without value', async () => {
    await expect(
      service.execute({
        ...baseInput,
        allocations: [
          {
            costCenterId: 'cc-1',
            accountPlanId: 'ap-1',
            costCategoryId: 'cat-1',
            cropSeasonId: 'season-1',
            allocatedValueInCents: 250000,
          },
          {
            costCenterId: 'cc-1',
            accountPlanId: 'ap-1',
            costCategoryId: 'cat-1',
            cropSeasonId: 'season-1',
            fieldIds: ['field-a'],
          },
        ],
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('rateia cross-farm por área sem allocatedValueInCents (PR-29)', async () => {
    findAccessibleByUser.mockResolvedValue({
      id: 'farm-2',
      organizationId: 'org-1',
    } as never);

    cropSeasonRepository.findById.mockImplementation(
      (id: string, farmId: string) => {
        if (id === 'season-1' && farmId === 'farm-1') {
          return Promise.resolve({
            id: 'season-1',
            status: CropSeasonStatus.ACTIVE,
          } as never);
        }
        if (id === 'season-2' && farmId === 'farm-2') {
          return Promise.resolve({
            id: 'season-2',
            status: CropSeasonStatus.ACTIVE,
          } as never);
        }
        return Promise.resolve(null);
      },
    );

    cropPlantingRepository.findAllBySeason.mockImplementation(
      (seasonId: string) => {
        if (seasonId === 'season-1') {
          return Promise.resolve([
            {
              fieldId: 'field-a',
              plantedAreaHa: { toString: () => '2' },
              field: { areaHa: { toString: () => '2' } },
            },
          ] as never);
        }
        return Promise.resolve([
          {
            fieldId: 'field-c',
            plantedAreaHa: { toString: () => '1' },
            field: { areaHa: { toString: () => '1' } },
          },
        ] as never);
      },
    );

    await service.execute({
      ...baseInput,
      installments: [
        {
          valueInCents: 10000,
          dueDate: new Date('2026-08-20'),
          paymentForm: 'PIX',
        },
      ],
      allocations: [
        {
          costCenterId: 'cc-1',
          accountPlanId: 'ap-1',
          costCategoryId: 'cat-1',
          cropSeasonId: 'season-1',
          fieldIds: ['field-a'],
        },
        {
          farmId: 'farm-2',
          costCenterId: 'cc-1',
          accountPlanId: 'ap-1',
          costCategoryId: 'cat-1',
          cropSeasonId: 'season-2',
          fieldIds: ['field-c'],
        },
      ],
    });

    expect(findAccessibleByUser).toHaveBeenCalledWith('farm-2', 'user-1');

    const createArg = createExpense.mock.calls[0][0];
    expect(createArg.farmId).toBe('farm-1');
    expect(createArg.allocations).toHaveLength(2);

    const entryA = createArg.allocations[0].costEntries[0];
    const entryC = createArg.allocations[1].costEntries[0];
    expect(entryA.amountInCents).toBe(6667n);
    expect(entryA.farmId).toBe('farm-1');
    expect(entryC.amountInCents).toBe(3333n);
    expect(entryC.farmId).toBe('farm-2');
    expect(entryA.amountInCents + entryC.amountInCents).toBe(10000n);
  });

  it('rateia o mesmo talhão em duas safras sem colidir a cota', async () => {
    cropSeasonRepository.findById.mockImplementation((id: string) => {
      return Promise.resolve({
        id,
        status: CropSeasonStatus.ACTIVE,
      } as never);
    });

    cropPlantingRepository.findAllBySeason.mockImplementation(
      (seasonId: string) => {
        const area = seasonId === 'season-1' ? '2' : '1';
        return Promise.resolve([
          {
            fieldId: 'field-shared',
            plantedAreaHa: { toString: () => area },
            field: { areaHa: { toString: () => area } },
          },
        ] as never);
      },
    );

    await service.execute({
      ...baseInput,
      installments: [
        {
          valueInCents: 10000,
          dueDate: new Date('2026-08-20'),
          paymentForm: 'PIX',
        },
      ],
      allocations: [
        {
          costCenterId: 'cc-1',
          accountPlanId: 'ap-1',
          costCategoryId: 'cat-1',
          cropSeasonId: 'season-1',
          fieldIds: ['field-shared'],
        },
        {
          costCenterId: 'cc-1',
          accountPlanId: 'ap-1',
          costCategoryId: 'cat-1',
          cropSeasonId: 'season-2',
          fieldIds: ['field-shared'],
        },
      ],
    });

    const payload = createExpense.mock.calls[0][0];
    const amounts = payload.allocations.map(
      (allocation) => allocation.costEntries[0].amountInCents,
    );
    expect(amounts).toEqual([6667n, 3333n]);
    expect(amounts[0] + amounts[1]).toBe(10000n);
  });

  it('rejects inaccessible destination farm', async () => {
    findAccessibleByUser.mockResolvedValue(null);

    await expect(
      service.execute({
        ...baseInput,
        installments: [
          {
            valueInCents: 10000,
            dueDate: new Date('2026-08-20'),
            paymentForm: 'PIX',
          },
        ],
        allocations: [
          {
            farmId: 'farm-other',
            costCenterId: 'cc-1',
            accountPlanId: 'ap-1',
            costCategoryId: 'cat-1',
            cropSeasonId: 'season-x',
          },
        ],
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it('rejects closed destination season in PR-29 mode', async () => {
    findAccessibleByUser.mockResolvedValue({
      id: 'farm-2',
      organizationId: 'org-1',
    } as never);
    cropSeasonRepository.findById.mockResolvedValue({
      id: 'season-2',
      status: CropSeasonStatus.CLOSED,
    } as never);

    await expect(
      service.execute({
        ...baseInput,
        installments: [
          {
            valueInCents: 10000,
            dueDate: new Date('2026-08-20'),
            paymentForm: 'PIX',
          },
        ],
        allocations: [
          {
            farmId: 'farm-2',
            costCenterId: 'cc-1',
            accountPlanId: 'ap-1',
            costCategoryId: 'cat-1',
            cropSeasonId: 'season-2',
          },
        ],
      }),
    ).rejects.toThrow(ConflictException);
  });
});
