import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { EmployeeType } from '@prisma/client';
import { resolveOptionalFarmId } from 'src/common/tenancy/resolve-optional-farm-id';
import {
  EMPLOYEE_REPOSITORY,
  EmployeeRepository,
} from '../repositories/employee.repository';

type CreateEmployeeInput = {
  name: string;
  registration: string;
  type: EmployeeType;
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

    const farmId = resolveOptionalFarmId(input.farmId, input.activeFarmId);

    const employee = await this.employeeRepository.create({
      name: input.name,
      registration: input.registration,
      type: input.type,
      organizationId: input.organizationId,
      farmId,
    });

    return { employee };
  }
}
