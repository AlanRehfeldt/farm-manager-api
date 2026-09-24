import {
  CloseEmployeeLaborData,
  LaborMonthClosingRecord,
  OpenCltLaborLine,
} from './@types';

export interface LaborClosingRepository {
  findOpenCltLaborInOrgMonth(
    organizationId: string,
    year: number,
    month: number,
  ): Promise<OpenCltLaborLine[]>;

  findOpenCltLaborMonthsForSeason(
    cropSeasonId: string,
  ): Promise<{ year: number; month: number }[]>;

  hasSalaryAllocationInOrgMonth(
    employeeId: string,
    organizationId: string,
    year: number,
    month: number,
  ): Promise<boolean>;

  findClosing(
    employeeId: string,
    year: number,
    month: number,
  ): Promise<LaborMonthClosingRecord | null>;

  closeOrgMonth(
    employees: CloseEmployeeLaborData[],
  ): Promise<LaborMonthClosingRecord[]>;
}

export const LABOR_CLOSING_REPOSITORY = 'LABOR_CLOSING_REPOSITORY';
