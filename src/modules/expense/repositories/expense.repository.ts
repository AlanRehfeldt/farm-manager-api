import {
  CreateExpenseData,
  CreateExpenseResult,
  ExpenseWithRelations,
  SearchManyExpensesQuery,
} from './@types';

export interface ExpenseRepository {
  create(data: CreateExpenseData): Promise<CreateExpenseResult>;
  findById(id: string, farmId: string): Promise<ExpenseWithRelations | null>;
  searchMany(query: SearchManyExpensesQuery): Promise<ExpenseWithRelations[]>;
  count(query: SearchManyExpensesQuery): Promise<number>;
}

export const EXPENSE_REPOSITORY = 'EXPENSE_REPOSITORY';
