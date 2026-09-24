import { ConflictException, NotFoundException } from '@nestjs/common';
import { EmploymentType } from '@prisma/client';
import { EmployeeRepository } from '../repositories/employee.repository';
import { UpdateEmployeeService } from './update-employee.service';

describe('UpdateEmployeeService employment type', () => {
  const employeeRepository: jest.Mocked<
    Pick<
      EmployeeRepository,
      | 'findById'
      | 'findByRegistration'
      | 'update'
      | 'hasOpenLabor'
      | 'hasClosingInMonth'
    >
  > = {
    findById: jest.fn(),
    findByRegistration: jest.fn(),
    update: jest.fn(),
    hasOpenLabor: jest.fn(),
    hasClosingInMonth: jest.fn(),
  };

  const service = new UpdateEmployeeService(
    employeeRepository as unknown as EmployeeRepository,
  );

  const existing = {
    id: 'emp-1',
    organizationId: 'org-1',
    farmId: null,
    name: 'João',
    registration: '001',
    type: 'FIELD_WORKER' as const,
    employmentType: EmploymentType.CLT,
    monthlySalaryInCents: 320000n,
    expectedMonthlyHours: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    employeeRepository.findById.mockResolvedValue(existing);
    employeeRepository.findByRegistration.mockResolvedValue(null);
    employeeRepository.hasOpenLabor.mockResolvedValue(false);
    employeeRepository.hasClosingInMonth.mockResolvedValue(false);
    employeeRepository.update.mockResolvedValue({
      ...existing,
      employmentType: EmploymentType.CONTRACTOR,
      monthlySalaryInCents: null,
    });
  });

  it('blocks employment type change when open labor hours exist', async () => {
    employeeRepository.hasOpenLabor.mockResolvedValue(true);

    await expect(
      service.execute('org-1', 'farm-1', {
        id: 'emp-1',
        employmentType: EmploymentType.CONTRACTOR,
      }),
    ).rejects.toBeInstanceOf(ConflictException);

    expect(employeeRepository.update).not.toHaveBeenCalled();
  });

  it('blocks employment type change when current month is closed', async () => {
    employeeRepository.hasClosingInMonth.mockResolvedValue(true);

    await expect(
      service.execute('org-1', 'farm-1', {
        id: 'emp-1',
        employmentType: EmploymentType.CONTRACTOR,
      }),
    ).rejects.toBeInstanceOf(ConflictException);

    expect(employeeRepository.update).not.toHaveBeenCalled();
  });

  it('does not check labor constraints when employment type is unchanged', async () => {
    employeeRepository.update.mockResolvedValue(existing);

    await service.execute('org-1', 'farm-1', {
      id: 'emp-1',
      employmentType: EmploymentType.CLT,
      name: 'João Silva',
    });

    expect(employeeRepository.hasOpenLabor).not.toHaveBeenCalled();
    expect(employeeRepository.hasClosingInMonth).not.toHaveBeenCalled();
    expect(employeeRepository.update).toHaveBeenCalled();
  });

  it('allows employment type change when no open labor or current closing', async () => {
    await service.execute('org-1', 'farm-1', {
      id: 'emp-1',
      employmentType: EmploymentType.CONTRACTOR,
    });

    expect(employeeRepository.hasOpenLabor).toHaveBeenCalledWith('emp-1');
    expect(employeeRepository.update).toHaveBeenCalled();
  });

  it('throws when employee does not exist', async () => {
    employeeRepository.findById.mockResolvedValue(null);

    await expect(
      service.execute('org-1', 'farm-1', {
        id: 'missing',
        employmentType: EmploymentType.CONTRACTOR,
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
