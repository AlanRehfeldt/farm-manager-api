import { Inject, Injectable } from '@nestjs/common';
import { Role, TransactionType } from '@prisma/client';
import { toExpenseResponse } from '../mappers/expense.mapper';
import {
  EXPENSE_REPOSITORY,
  ExpenseRepository,
} from '../repositories/expense.repository';

type FetchExpensesInput = {
  farmId: string;
  membershipRole: Role;
  name?: string;
  page: number;
  perPage: number;
  orderBy: string;
  orderDirection: 'asc' | 'desc';
};

@Injectable()
export class FetchExpensesService {
  constructor(
    @Inject(EXPENSE_REPOSITORY)
    private readonly expenseRepository: ExpenseRepository,
  ) {}

  async execute(input: FetchExpensesInput) {
    const excludeTypes =
      input.membershipRole === Role.ADMIN
        ? undefined
        : [TransactionType.SALARY_PAYMENT];

    const [results, total] = await Promise.all([
      this.expenseRepository.searchMany({ ...input, excludeTypes }),
      this.expenseRepository.count({ ...input, excludeTypes }),
    ]);

    return {
      results: results.map(toExpenseResponse),
      total,
      page: input.page,
      perPage: input.perPage,
      orderBy: input.orderBy,
      orderDirection: input.orderDirection,
    };
  }
}
