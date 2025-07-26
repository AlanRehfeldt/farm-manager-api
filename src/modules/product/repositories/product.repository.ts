import { Product } from '@prisma/client';
import {
  CreateProductData,
  SearchManyQuery,
  UpdateProductData,
} from './@types';

export interface ProductRepository {
  create(data: CreateProductData): Promise<Product>;
  update(data: UpdateProductData): Promise<Product>;
  delete(id: string): Promise<void>;
  findById(id: string): Promise<Product | null>;
  searchMany(query: SearchManyQuery): Promise<Product[]>;
  count(query: SearchManyQuery): Promise<number>;
}

export const PRODUCT_REPOSITORY = 'PRODUCT_REPOSITORY';
