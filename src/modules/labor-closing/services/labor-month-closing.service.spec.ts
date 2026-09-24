import { ConflictException, ForbiddenException } from '@nestjs/common';
import { Decimal } from '@prisma/client/runtime/library';
import { CostCategoryRepository } from 'src/modules/cost-category/repositories/cost-category.repository';
import { MembershipRepository } from 'src/modules/membership/repositories/membership.repository';
import { OpenCltLaborLine } from '../repositories/@types';
import { LaborClosingRepository } from '../repositories/labor-closing.repository';
import {
  CloseLaborMonthService,
  PreviewLaborMonthClosingService,
} from './labor-month-closing.service';

function openLine(
  overrides: Partial<OpenCltLaborLine> &
    Pick<OpenCltLaborLine, 'activityLaborId' | 'hours'>,
): OpenCltLaborLine {
  return {
    employeeId: 'emp-1',
    employeeName: 'João',
    activityId: 'act-1',
    activityDate: new Date('2026-09-10T12:00:00.000Z'),
    farmId: 'farm-1',
    cropSeasonId: 'season-1',
    fieldId: 'field-1',
    monthlySalaryInCents: 320000n,
    ...overrides,
  };
}

describe('labor month closing authorization', () => {
  const membershipRepository: jest.Mocked<
    Pick<MembershipRepository, 'findOrgAdmin'>
  > = {
    findOrgAdmin: jest.fn(),
  };

  const laborClosingRepository: jest.Mocked<
    Pick<
      LaborClosingRepository,
      | 'findOpenCltLaborInOrgMonth'
      | 'hasSalaryAllocationInOrgMonth'
      | 'findClosing'
      | 'closeOrgMonth'
    >
  > = {
    findOpenCltLaborInOrgMonth: jest.fn(),
    hasSalaryAllocationInOrgMonth: jest.fn(),
    findClosing: jest.fn(),
    closeOrgMonth: jest.fn(),
  };

  const costCategoryRepository: jest.Mocked<
    Pick<CostCategoryRepository, 'findByCode'>
  > = {
    findByCode: jest.fn(),
  };

  const previewService = new PreviewLaborMonthClosingService(
    laborClosingRepository as unknown as LaborClosingRepository,
    membershipRepository as unknown as MembershipRepository,
  );

  const closeService = new CloseLaborMonthService(
    laborClosingRepository as unknown as LaborClosingRepository,
    costCategoryRepository as unknown as CostCategoryRepository,
    membershipRepository as unknown as MembershipRepository,
  );

  beforeEach(() => {
    jest.clearAllMocks();
    membershipRepository.findOrgAdmin.mockResolvedValue({
      id: 'membership-org-admin',
    } as never);
    costCategoryRepository.findByCode.mockResolvedValue({
      id: 'mo-fixa',
    } as never);
    laborClosingRepository.findClosing.mockResolvedValue(null);
    laborClosingRepository.hasSalaryAllocationInOrgMonth.mockResolvedValue(
      false,
    );
    laborClosingRepository.closeOrgMonth.mockImplementation(async (employees) =>
      employees.map((employee) => ({
        id: `closing-${employee.employeeId}`,
        organizationId: employee.organizationId,
        employeeId: employee.employeeId,
        year: employee.year,
        month: employee.month,
        salaryInCents: employee.salaryInCents,
        totalHours: employee.totalHours,
        closedByUserId: employee.closedByUserId,
        closedAt: new Date(),
      })),
    );
  });

  it('rejects preview when actor is only a farm-scoped admin', async () => {
    membershipRepository.findOrgAdmin.mockResolvedValue(null);

    await expect(
      previewService.execute('org-1', 2026, 9, 'user-farm-admin'),
    ).rejects.toBeInstanceOf(ForbiddenException);

    expect(
      laborClosingRepository.findOpenCltLaborInOrgMonth,
    ).not.toHaveBeenCalled();
  });

  it('rejects close when actor is only a farm-scoped admin', async () => {
    membershipRepository.findOrgAdmin.mockResolvedValue(null);

    await expect(
      closeService.execute({
        organizationId: 'org-1',
        year: 2026,
        month: 9,
        closedByUserId: 'user-farm-admin',
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);

    expect(
      laborClosingRepository.findOpenCltLaborInOrgMonth,
    ).not.toHaveBeenCalled();
    expect(laborClosingRepository.closeOrgMonth).not.toHaveBeenCalled();
  });
});

describe('CloseLaborMonthService', () => {
  const membershipRepository: jest.Mocked<
    Pick<MembershipRepository, 'findOrgAdmin'>
  > = {
    findOrgAdmin: jest.fn(),
  };

  const laborClosingRepository: jest.Mocked<
    Pick<
      LaborClosingRepository,
      | 'findOpenCltLaborInOrgMonth'
      | 'hasSalaryAllocationInOrgMonth'
      | 'findClosing'
      | 'closeOrgMonth'
    >
  > = {
    findOpenCltLaborInOrgMonth: jest.fn(),
    hasSalaryAllocationInOrgMonth: jest.fn(),
    findClosing: jest.fn(),
    closeOrgMonth: jest.fn(),
  };

  const costCategoryRepository: jest.Mocked<
    Pick<CostCategoryRepository, 'findByCode'>
  > = {
    findByCode: jest.fn(),
  };

  const service = new CloseLaborMonthService(
    laborClosingRepository as unknown as LaborClosingRepository,
    costCategoryRepository as unknown as CostCategoryRepository,
    membershipRepository as unknown as MembershipRepository,
  );

  beforeEach(() => {
    jest.clearAllMocks();
    membershipRepository.findOrgAdmin.mockResolvedValue({
      id: 'membership-org-admin',
    } as never);
    costCategoryRepository.findByCode.mockResolvedValue({
      id: 'mo-fixa',
    } as never);
    laborClosingRepository.findClosing.mockResolvedValue(null);
    laborClosingRepository.hasSalaryAllocationInOrgMonth.mockResolvedValue(
      false,
    );
    laborClosingRepository.closeOrgMonth.mockImplementation(async (employees) =>
      employees.map((employee) => ({
        id: `closing-${employee.employeeId}`,
        organizationId: employee.organizationId,
        employeeId: employee.employeeId,
        year: employee.year,
        month: employee.month,
        salaryInCents: employee.salaryInCents,
        totalHours: employee.totalHours,
        closedByUserId: employee.closedByUserId,
        closedAt: new Date(),
      })),
    );
  });

  it('dilutes salary across open hours in one transaction', async () => {
    laborClosingRepository.findOpenCltLaborInOrgMonth.mockResolvedValue([
      openLine({ activityLaborId: 'lab-a', hours: new Decimal(100) }),
      openLine({
        activityLaborId: 'lab-b',
        hours: new Decimal(60),
        activityId: 'act-2',
      }),
    ]);

    const result = await service.execute({
      organizationId: 'org-1',
      year: 2026,
      month: 9,
      closedByUserId: 'user-1',
    });

    expect(laborClosingRepository.closeOrgMonth).toHaveBeenCalledTimes(1);
    const [batch] = laborClosingRepository.closeOrgMonth.mock.calls[0];
    expect(batch).toHaveLength(1);
    const amounts = batch[0].allocations.map((line) => line.amountInCents);
    expect(amounts.reduce((sum, amount) => sum + amount, 0n)).toBe(320000n);
    expect(result.closedCount).toBe(1);
    expect(result.employees[0].closingId).toBe('closing-emp-1');
  });

  it('rejects a second close when there are no open hours', async () => {
    laborClosingRepository.findOpenCltLaborInOrgMonth.mockResolvedValue([]);

    await expect(
      service.execute({
        organizationId: 'org-1',
        year: 2026,
        month: 9,
        closedByUserId: 'user-1',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(laborClosingRepository.closeOrgMonth).not.toHaveBeenCalled();
  });

  it('does not write when salary is already allocated in the month', async () => {
    laborClosingRepository.findOpenCltLaborInOrgMonth.mockResolvedValue([
      openLine({ activityLaborId: 'lab-a', hours: new Decimal(160) }),
    ]);
    laborClosingRepository.hasSalaryAllocationInOrgMonth.mockResolvedValue(
      true,
    );

    await expect(
      service.execute({
        organizationId: 'org-1',
        year: 2026,
        month: 9,
        closedByUserId: 'user-1',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(laborClosingRepository.closeOrgMonth).not.toHaveBeenCalled();
  });

  it('does not write when a CLT employee has hours but no salary', async () => {
    laborClosingRepository.findOpenCltLaborInOrgMonth.mockResolvedValue([
      openLine({
        activityLaborId: 'lab-a',
        hours: new Decimal(8),
        monthlySalaryInCents: 0n,
      }),
    ]);

    await expect(
      service.execute({
        organizationId: 'org-1',
        year: 2026,
        month: 9,
        closedByUserId: 'user-1',
      }),
    ).rejects.toThrow('no monthly salary');
    expect(laborClosingRepository.closeOrgMonth).not.toHaveBeenCalled();
  });
});
