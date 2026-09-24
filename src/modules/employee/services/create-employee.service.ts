import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { EmployeeType, EmploymentType } from '@prisma/client';
import { resolveOptionalFarmId } from 'src/common/tenancy/resolve-optional-farm-id';
import { toEmployeeResponse } from '../repositories/@types';
import {
  EMPLOYEE_REPOSITORY,
  EmployeeRepository,
} from '../repositories/employee.repository';

type CreateEmployeeInput = {
  name: string;
  registration: string;
  type: EmployeeType;
  employmentType: EmploymentType;
  monthlySalaryInCents?: number;
  expectedMonthlyHours?: string;
  farmId?: string | null;
  organizationId: string;
  activeFarmId: string;
};

@Injectable()
export class CreateEmployeeService {
  constructor(
    @Inject(EMPLOYEE_REPOSITORY)
    private readonly employeeRepository: EmployeeRepository,
  ) {}

  async execute(input: CreateEmployeeInput) {
    const checkIfRegistrationExists =
      await this.employeeRepository.findByRegistration(
        input.organizationId,
        input.registration,
      );
    if (checkIfRegistrationExists) {
      throw new ConflictException('Registration already exists');
    }

    if (input.employmentType === EmploymentType.CLT) {
      if (
        input.monthlySalaryInCents == null ||
        input.monthlySalaryInCents <= 0
      ) {
        throw new BadRequestException(
          'CLT employees require monthlySalaryInCents greater than zero',
        );
      }
    } else if (input.monthlySalaryInCents != null) {
      throw new BadRequestException(
        'CONTRACTOR employees cannot have monthlySalaryInCents',
      );
    }

    if (
      input.employmentType === EmploymentType.CONTRACTOR &&
      input.expectedMonthlyHours != null
    ) {
      throw new BadRequestException(
        'CONTRACTOR employees cannot have expectedMonthlyHours',
      );
    }

    const farmId = resolveOptionalFarmId(input.farmId, input.activeFarmId);

    const employee = await this.employeeRepository.create({
      name: input.name,
      registration: input.registration,
      type: input.type,
      employmentType: input.employmentType,
      monthlySalaryInCents:
        input.employmentType === EmploymentType.CLT
          ? BigInt(input.monthlySalaryInCents!)
          : null,
      expectedMonthlyHours:
        input.employmentType === EmploymentType.CLT
          ? (input.expectedMonthlyHours ?? null)
          : null,
      organizationId: input.organizationId,
      farmId,
    });

    return { employee: toEmployeeResponse(employee) };
  }
}
