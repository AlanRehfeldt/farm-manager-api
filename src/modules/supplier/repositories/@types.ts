import { Prisma } from '@prisma/client';

export type CreateSupplierData = Prisma.SupplierUncheckedCreateInput;

export interface UpdateSupplierData {
  id: string;
  name?: string;
  cnpj?: string | null;
  cpf?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  phoneNumber?: string | null;
}

export interface SearchManyQuery {
  id?: string;
  name?: string;
  cnpj?: string;
  cpf?: string;
  address?: string;
  phoneNumber?: string;
  organizationId: string;
  farmId: string;
  page: number;
  perPage: number;
  orderBy: string;
  orderDirection: 'asc' | 'desc';
}
