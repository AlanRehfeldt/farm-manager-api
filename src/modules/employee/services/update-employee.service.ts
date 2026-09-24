import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EmployeeType, EmploymentType } from '@prisma/client';
import { toEmployeeResponse } from '../repositories/@types';
import {
  EMPLOYEE_REPOSITORY,
  EmployeeRepository,
} from '../repositories/employee.repository';

type UpdateEmployeeInput = {
  id: string;
  name?: string;
  registration?: string;
  type?: EmployeeType;
  employmentType?: EmploymentType;
  monthlySalaryInCents?: number | null;
  expectedMonthlyHours?: string | null;
};

@Injectable()
export class UpdateEmployeeService {
  constructor(
    @Inject(EMPLOYEE_REPOSITORY)
    private readonly employeeRepository: EmployeeRepository,
  ) {}

  async execute(
    organizationId: string,
    farmId: string,
    input: UpdateEmployeeInput,
  ) {
    const existing = await this.employeeRepository.findById(
      input.id,
      organizationId,
      farmId,
    );
    if (!existing) {
      throw new NotFoundException('Employee does not exist');
    }

    if (input.registration) {
      const duplicate = await this.employeeRepository.findByRegistration(
        organizationId,
        input.registration,
      );
      if (duplicate && duplicate.id !== input.id) {
        throw new ConflictException('Registration already exists');
      }
    }

    const employmentType = input.employmentType ?? existing.employmentType;

    if (
      input.employmentType != null &&
      input.employmentType !== existing.employmentType
    ) {
      const hasOpenLabor = await this.employeeRepository.hasOpenLabor(input.id);
      if (hasOpenLabor) {
        throw new ConflictException(
          'Cannot change employment type while the employee has open labor hours. Reverse those activities or close the month first.',
        );
      }

      const now = new Date();
      const hasClosing = await this.employeeRepository.hasClosingInMonth(
        input.id,
        now.getUTCFullYear(),
        now.getUTCMonth() + 1,
      );
      if (hasClosing) {
        throw new ConflictException(
          'Cannot change employment type while the current month is closed. Reopen the labor month closing first.',
        );
      }
    }

    let monthlySalaryInCents: bigint | null | undefined =
      input.monthlySalaryInCents === undefined
        ? undefined
        : input.monthlySalaryInCents == null
          ? null
          : BigInt(input.monthlySalaryInCents);

    let expectedMonthlyHours: string | null | undefined =
      input.expectedMonthlyHours;

    if (employmentType === EmploymentType.CLT) {
      const resolvedSalary =
        monthlySalaryInCents !== undefined
          ? monthlySalaryInCents
          : existing.monthlySalaryInCents;

      if (resolvedSalary == null || resolvedSalary <= 0n) {
        throw new BadRequestException(
          'CLT employees require monthlySalaryInCents greater than zero',
        );
      }
    } else {
      if (
        input.monthlySalaryInCents != null &&
        input.monthlySalaryInCents !== undefined
      ) {
        throw new BadRequestException(
          'CONTRACTOR employees cannot have monthlySalaryInCents',
        );
      }
      if (
        input.expectedMonthlyHours != null &&
        input.expectedMonthlyHours !== undefined
      ) {
        throw new BadRequestException(
          'CONTRACTOR employees cannot have expectedMonthlyHours',
        );
      }
      monthlySalaryInCents = null;
      expectedMonthlyHours = null;
    }

    const employee = await this.employeeRepository.update({
      id: input.id,
      name: input.name,
      registration: input.registration,
      type: input.type,
      employmentType: input.employmentType,
      monthlySalaryInCents,
      expectedMonthlyHours,
    });

    return { employee: toEmployeeResponse(employee) };
  }
}
