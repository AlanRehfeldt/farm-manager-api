import { Prisma, UomDimension } from '@prisma/client';

export type CreateUnitOfMeasurementData =
  Prisma.UnitOfMeasurementUncheckedCreateInput;

export interface UpdateUnitOfMeasurementData {
  id: string;
  name?: string;
  acronym?: string;
  dimension?: UomDimension;
  isBase?: boolean;
  factorToBase?: Prisma.Decimal;
}

export interface SearchManyQuery {
  id?: string;
  name?: string;
  acronym?: string;
  organizationId: string;
  page: number;
  perPage: number;
  orderBy: string;
  orderDirection: 'asc' | 'desc';
}
