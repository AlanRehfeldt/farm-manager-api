import { TransactionType, Prisma } from '@prisma/client';

export type CreateTransactionData = Prisma.TransactionUncheckedCreateInput;

export interface UpdateTransactionData {
  id: string;
  type?: TransactionType;
  date?: Date;
  note?: string;
}

export interface SearchManyQuery {
  id?: string;
  type?: TransactionType;
  dateFrom?: Date;
  dateTo?: Date;
  note?: string;
  page: number;
  perPage: number;
  orderBy: string;
  orderDirection: 'asc' | 'desc';
}
