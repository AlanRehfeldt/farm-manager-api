import { Transaction } from '@prisma/client';
import {
  CreateTransactionData,
  SearchManyQuery,
  UpdateTransactionData,
} from './@types';

export interface TransactionRepository {
  create(data: CreateTransactionData): Promise<Transaction>;
  update(data: UpdateTransactionData): Promise<Transaction>;
  delete(id: string): Promise<void>;
  findById(id: string, farmId: string): Promise<Transaction | null>;
  searchMany(query: SearchManyQuery): Promise<Transaction[]>;
  count(query: SearchManyQuery): Promise<number>;
}

export const TRANSACTION_REPOSITORY = 'TRANSACTION_REPOSITORY';
