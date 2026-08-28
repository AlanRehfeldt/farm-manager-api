import { Supplier } from '@prisma/client';
import {
  CreateSupplierData,
  SearchManyQuery,
  UpdateSupplierData,
} from './@types';

export interface SupplierRepository {
  create(data: CreateSupplierData): Promise<Supplier>;
  update(data: UpdateSupplierData): Promise<Supplier>;
  delete(id: string): Promise<void>;
  findById(
    id: string,
    organizationId: string,
    farmId: string,
  ): Promise<Supplier | null>;
  findByCnpj(organizationId: string, cnpj: string): Promise<Supplier | null>;
  searchMany(query: SearchManyQuery): Promise<Supplier[]>;
  count(query: SearchManyQuery): Promise<number>;
}

export const SUPPLIER_REPOSITORY = 'SUPPLIER_REPOSITORY';
