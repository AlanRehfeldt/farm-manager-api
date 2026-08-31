import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { toExpenseResponse } from '../mappers/expense.mapper';
import {
  EXPENSE_REPOSITORY,
  ExpenseRepository,
} from '../repositories/expense.repository';

type GetExpenseInput = {
  id: string;
  farmId: string;
};

@Injectable()
export class GetExpenseService {
  constructor(
    @Inject(EXPENSE_REPOSITORY)
    private readonly expenseRepository: ExpenseRepository,
  ) {}

  async execute(input: GetExpenseInput) {
    const expense = await this.expenseRepository.findById(
      input.id,
      input.farmId,
    );
    if (!expense) {
      throw new NotFoundException('Expense not found');
    }

    return { expense: toExpenseResponse(expense) };
  }
}
