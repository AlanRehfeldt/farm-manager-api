import {
  CreateExpenseData,
  CreateExpenseResult,
  ExpenseWithRelations,
  ReverseExpenseData,
  ReverseExpenseResult,
  SearchManyExpensesQuery,
} from './@types';

export interface ExpenseRepository {
  create(data: CreateExpenseData): Promise<CreateExpenseResult>;
  reverse(data: ReverseExpenseData): Promise<ReverseExpenseResult>;
  findById(id: string, farmId: string): Promise<ExpenseWithRelations | null>;
  searchMany(query: SearchManyExpensesQuery): Promise<ExpenseWithRelations[]>;
  count(query: SearchManyExpensesQuery): Promise<number>;
}

export const EXPENSE_REPOSITORY = 'EXPENSE_REPOSITORY';
