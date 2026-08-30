import { Prisma } from '@prisma/client';

export type CreateMachineData = Prisma.MachineUncheckedCreateInput;

export interface UpdateMachineData {
  id: string;
  name?: string;
  hourlyCostInCents?: bigint;
  fuelIncludedInHourlyCost?: boolean;
  active?: boolean;
}

export interface SearchManyQuery {
  id?: string;
  name?: string;
  active?: boolean;
  farmId: string;
  page: number;
  perPage: number;
  orderBy: string;
  orderDirection: 'asc' | 'desc';
}
