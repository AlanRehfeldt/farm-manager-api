import { Decimal } from '@prisma/client/runtime/library';

export type OpenCltLaborLine = {
  activityLaborId: string;
  employeeId: string;
  employeeName: string;
  hours: Decimal;
  activityId: string;
  activityDate: Date;
  farmId: string;
  cropSeasonId: string;
  fieldId: string;
  monthlySalaryInCents: bigint;
};

export type LaborMonthClosingRecord = {
  id: string;
  organizationId: string;
  employeeId: string;
  year: number;
  month: number;
  salaryInCents: bigint;
  totalHours: Decimal;
  closedByUserId: string;
  closedAt: Date;
};

export type LaborMonthClosingWithEmployee = LaborMonthClosingRecord & {
  employeeName: string;
};

export type CloseLaborLineAllocation = {
  activityLaborId: string;
  amountInCents: bigint;
  farmId: string;
  cropSeasonId: string;
  fieldId: string;
  activityId: string;
  activityDate: Date;
};

export type CloseEmployeeLaborData = {
  organizationId: string;
  employeeId: string;
  year: number;
  month: number;
  salaryInCents: bigint;
  totalHours: Decimal;
  closedByUserId: string;
  moFixaCostCategoryId: string;
  allocations: CloseLaborLineAllocation[];
};
