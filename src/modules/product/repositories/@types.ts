import { Prisma } from '@prisma/client';

export type CreateProductData = Prisma.ProductUncheckedCreateInput;

export interface UpdateProductData {
  id: string;
  name?: string;
  description?: string;
  unitOfMeasurementId?: string;
  costCategoryId?: string;
}

export interface SearchManyQuery {
  id?: string;
  name?: string;
  description?: string;
  unitOfMeasurementId?: string;
  organizationId: string;
  farmId: string;
  page: number;
  perPage: number;
  orderBy: string;
  orderDirection: 'asc' | 'desc';
}
