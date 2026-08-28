import { EmployeeType, Prisma } from '@prisma/client';

export type CreateEmployeeData = Prisma.EmployeeUncheckedCreateInput;

export interface UpdateEmployeeData {
  id: string;
  name?: string;
  registration?: string;
  type?: EmployeeType;
}

export interface SearchManyQuery {
  id?: string;
  name?: string;
  registration?: string;
  type?: EmployeeType;
  organizationId: string;
  farmId: string;
  page: number;
  perPage: number;
  orderBy: string;
  orderDirection: 'asc' | 'desc';
}
