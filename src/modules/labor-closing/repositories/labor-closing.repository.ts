import {
  CloseEmployeeLaborData,
  LaborMonthClosingRecord,
  LaborMonthClosingWithEmployee,
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

  findClosingById(
    id: string,
    organizationId: string,
  ): Promise<LaborMonthClosingRecord | null>;

  findClosingsInOrgMonth(
    organizationId: string,
    year: number,
    month: number,
  ): Promise<LaborMonthClosingWithEmployee[]>;

  closeOrgMonth(
    employees: CloseEmployeeLaborData[],
  ): Promise<LaborMonthClosingRecord[]>;

  reopenClosing(data: {
    closingId: string;
    organizationId: string;
    reason: string;
    reopenedAt: Date;
  }): Promise<LaborMonthClosingRecord>;
}

export const LABOR_CLOSING_REPOSITORY = 'LABOR_CLOSING_REPOSITORY';
