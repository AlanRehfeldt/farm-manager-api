import { Test } from '@nestjs/testing';
import { ReverseExpenseService } from './reverse-expense.service';
import {
  EXPENSE_REPOSITORY,
  ExpenseRepository,
} from '../repositories/expense.repository';

describe('ReverseExpenseService', () => {
  const reverse = jest.fn();
  const expenseRepository: jest.Mocked<ExpenseRepository> = {
    create: jest.fn(),
    reverse,
    findById: jest.fn(),
    searchMany: jest.fn(),
    count: jest.fn(),
  };

  let service: ReverseExpenseService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module = await Test.createTestingModule({
      providers: [
        ReverseExpenseService,
        { provide: EXPENSE_REPOSITORY, useValue: expenseRepository },
      ],
    }).compile();

    service = module.get(ReverseExpenseService);
  });

  it('reverses expense through repository', async () => {
    reverse.mockResolvedValue({
      expense: {
        id: 'expense-1',
        farmId: 'farm-1',
        type: 'GENERIC',
        date: new Date('2026-03-01'),
        note: '[Estornado] motivo',
        createdAt: new Date(),
        updatedAt: new Date(),
        installments: [],
        transactionAllocations: [
          {
            id: 'alloc-1',
            transactionId: 'expense-1',
            costCenterId: 'cc-1',
            accountPlanId: 'ap-1',
            costCategoryId: 'cat-1',
            cropSeasonId: 'season-1',
            fieldId: null,
            allocatedValueInCents: BigInt(10000),
            createdAt: new Date(),
            updatedAt: new Date(),
            costCenter: { id: 'cc-1', name: 'CC', code: '01' },
            accountPlan: { id: 'ap-1', name: 'AP', code: '01' },
            costCategory: { id: 'cat-1', code: 'outros', name: 'Outros' },
            cropSeason: { id: 'season-1', name: '2026', status: 'ACTIVE' },
            field: null,
            costEntries: [
              {
                id: 'ce-1',
                farmId: 'farm-1',
                cropSeasonId: 'season-1',
                fieldId: null,
                activityId: null,
                sourceType: 'ALLOCATION',
                sourceId: 'alloc-1',
                costCategoryId: 'cat-1',
                amountInCents: BigInt(10000),
                quantity: null,
                uomId: null,
                date: new Date('2026-03-01'),
                reversedAt: new Date('2026-03-02'),
                reversalOfId: null,
                createdAt: new Date(),
                updatedAt: new Date(),
                costCategory: { id: 'cat-1', code: 'outros', name: 'Outros' },
                field: null,
              },
            ],
          },
        ],
        salaryTransaction: null,
        genericDetails: { subtype: 'GENERAL_EXPENSE' },
      },
    });

    const result = await service.execute({
      expenseId: 'expense-1',
      farmId: 'farm-1',
      reason: 'Alocação incorreta',
    });

    expect(reverse).toHaveBeenCalledWith(
      expect.objectContaining({
        expenseId: 'expense-1',
        farmId: 'farm-1',
        reason: 'Alocação incorreta',
      }),
    );
    expect(result.expense.reversedAt).not.toBeNull();
    expect(result.expense.totalInCents).toBe(0);
  });
});
