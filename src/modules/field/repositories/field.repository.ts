import { Field } from '@prisma/client';
import { CreateFieldData, SearchManyQuery, UpdateFieldData } from './@types';

export interface FieldRepository {
  create(data: CreateFieldData): Promise<Field>;
  update(data: UpdateFieldData): Promise<Field>;
  delete(id: string): Promise<void>;
  findById(id: string, farmId: string): Promise<Field | null>;
  findByName(farmId: string, name: string): Promise<Field | null>;
  searchMany(query: SearchManyQuery): Promise<Field[]>;
  count(query: SearchManyQuery): Promise<number>;
}

export const FIELD_REPOSITORY = 'FIELD_REPOSITORY';
