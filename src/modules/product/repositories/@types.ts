import { Prisma } from '@prisma/client';

export type CreateProductData = Prisma.ProductUncheckedCreateInput;

export interface UpdateProductData {
  id: string;
  name?: string;
  description?: string;
  unitOfMeasurementId?: string;
}

export interface SearchManyQuery {
  id?: string;
  name?: string;
  description?: string;
  unitOfMeasurementId?: string;
  page: number;
  perPage: number;
  orderBy: string;
  orderDirection: 'asc' | 'desc';
}
