import { Prisma } from '@prisma/client';

export type CreateSupplierData = Prisma.SupplierUncheckedCreateInput;

export interface UpdateSupplierData {
  id: string;
  name?: string;
  cnpj?: string;
  address?: string;
  phoneNumber?: string;
}

export interface SearchManyQuery {
  id?: string;
  name?: string;
  cnpj?: string;
  address?: string;
  phoneNumber?: string;
  page: number;
  perPage: number;
  orderBy: string;
  orderDirection: 'asc' | 'desc';
}
