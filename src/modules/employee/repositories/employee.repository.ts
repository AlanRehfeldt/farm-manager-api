import { Employee } from '@prisma/client';
import {
  CreateEmployeeData,
  SearchManyQuery,
  UpdateEmployeeData,
} from './@types';

export interface EmployeeRepository {
  create(data: CreateEmployeeData): Promise<Employee>;
  update(data: UpdateEmployeeData): Promise<Employee>;
  delete(id: string): Promise<void>;
  findById(id: string): Promise<Employee | null>;
  findById(
    id: string,
    organizationId: string,
    farmId: string,
  ): Promise<Employee | null>;
  findByRegistration(
    organizationId: string,
    registration: string,
  ): Promise<Employee | null>;
  searchMany(query: SearchManyQuery): Promise<Employee[]>;
  count(query: SearchManyQuery): Promise<number>;
}

export const EMPLOYEE_REPOSITORY = 'EMPLOYEE_REPOSITORY';
