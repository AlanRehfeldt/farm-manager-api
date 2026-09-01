import { Inject, Injectable } from '@nestjs/common';
import { toExpenseResponse } from '../mappers/expense.mapper';
import {
  EXPENSE_REPOSITORY,
  ExpenseRepository,
} from '../repositories/expense.repository';

type ReverseExpenseInput = {
  expenseId: string;
  farmId: string;
  reason: string;
};

@Injectable()
export class ReverseExpenseService {
  constructor(
    @Inject(EXPENSE_REPOSITORY)
    private readonly expenseRepository: ExpenseRepository,
  ) {}

  async execute(input: ReverseExpenseInput) {
    const reversedAt = new Date();

    const { expense } = await this.expenseRepository.reverse({
      expenseId: input.expenseId,
      farmId: input.farmId,
      reason: input.reason,
      reversedAt,
    });

    return { expense: toExpenseResponse(expense) };
  }
}
