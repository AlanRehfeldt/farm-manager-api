import { PaymentForm, Prisma } from '@prisma/client';

export type CreateInstallmentData = Prisma.InstallmentUncheckedCreateInput;

export interface UpdateInstallmentData {
  id: string;
  valueInCents?: number;
  dueDate?: Date;
  paymentDate?: Date;
  paymentForm?: PaymentForm;
  transactionId?: string;
}

export interface SearchManyQuery {
  id?: string;
  valueInCentsFrom?: number;
  valueInCentsTo?: number;
  dueDateFrom?: Date;
  dueDateTo?: Date;
  paymentDateFrom?: Date;
  paymentDateTo?: Date;
  paymentForm?: PaymentForm;
  transactionId?: string;
  createdAtFrom?: Date;
  createdAtTo?: Date;
  updatedAtFrom?: Date;
  updatedAtTo?: Date;
  page: number;
  perPage: number;
  orderBy: string;
  orderDirection: 'asc' | 'desc';
}
