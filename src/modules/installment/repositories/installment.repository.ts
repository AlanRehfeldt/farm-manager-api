import { Installment } from '@prisma/client';
import {
  CreateInstallmentData,
  SearchManyQuery,
  UpdateInstallmentData,
} from './@types';

export interface InstallmentRepository {
  create(data: CreateInstallmentData): Promise<Installment>;
  update(data: UpdateInstallmentData): Promise<Installment>;
  delete(id: string): Promise<void>;
  findById(id: string): Promise<Installment | null>;
  searchMany(query: SearchManyQuery): Promise<Installment[]>;
  count(query: SearchManyQuery): Promise<number>;
}

export const INSTALLMENT_REPOSITORY = 'INSTALLMENT_REPOSITORY';
