import { Prisma } from '@prisma/client';

export type CreateFieldData = Prisma.FieldUncheckedCreateInput;

export interface UpdateFieldData {
  id: string;
  name?: string;
  areaHa?: Prisma.Decimal;
  active?: boolean;
  plantsPerHa?: Prisma.Decimal | null;
  plantedYear?: number | null;
  spacingNote?: string | null;
  externalRef?: string | null;
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
