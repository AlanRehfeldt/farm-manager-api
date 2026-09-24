import { Employee, EmployeeType, EmploymentType, Prisma } from '@prisma/client';
import { decimalToString } from 'src/common/serialization/decimal';
import { bigintToNumber } from 'src/common/serialization/money';

export type CreateEmployeeData = Prisma.EmployeeUncheckedCreateInput;

export interface UpdateEmployeeData {
  id: string;
  name?: string;
  registration?: string;
  type?: EmployeeType;
  employmentType?: EmploymentType;
  monthlySalaryInCents?: bigint | null;
  expectedMonthlyHours?: string | null;
}

export interface SearchManyQuery {
  id?: string;
  name?: string;
  registration?: string;
  type?: EmployeeType;
  organizationId: string;
  farmId: string;
  page: number;
  perPage: number;
  orderBy: string;
  orderDirection: 'asc' | 'desc';
}

export type EmployeeResponse = {
  id: string;
  organizationId: string;
  farmId: string | null;
  name: string;
  registration: string;
  type: EmployeeType;
  employmentType: EmploymentType;
  monthlySalaryInCents: number | null;
  expectedMonthlyHours: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export function toEmployeeResponse(employee: Employee): EmployeeResponse {
  return {
    id: employee.id,
    organizationId: employee.organizationId,
    farmId: employee.farmId,
    name: employee.name,
    registration: employee.registration,
    type: employee.type,
    employmentType: employee.employmentType,
    monthlySalaryInCents: bigintToNumber(employee.monthlySalaryInCents),
    expectedMonthlyHours: decimalToString(employee.expectedMonthlyHours),
    createdAt: employee.createdAt,
    updatedAt: employee.updatedAt,
  };
}
