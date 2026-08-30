import { Machine } from '@prisma/client';
import { CreateMachineData, SearchManyQuery, UpdateMachineData } from './@types';

export interface MachineRepository {
  create(data: CreateMachineData): Promise<Machine>;
  update(data: UpdateMachineData): Promise<Machine>;
  delete(id: string): Promise<void>;
  findById(id: string, farmId: string): Promise<Machine | null>;
  findByName(farmId: string, name: string): Promise<Machine | null>;
  searchMany(query: SearchManyQuery): Promise<Machine[]>;
  count(query: SearchManyQuery): Promise<number>;
}

export const MACHINE_REPOSITORY = 'MACHINE_REPOSITORY';
