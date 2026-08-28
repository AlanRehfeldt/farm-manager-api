import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UpdateEmployeeData } from '../repositories/@types';
import {
  EMPLOYEE_REPOSITORY,
  EmployeeRepository,
} from '../repositories/employee.repository';

@Injectable()
export class UpdateEmployeeService {
  constructor(
    @Inject(EMPLOYEE_REPOSITORY)
    private readonly employeeRepository: EmployeeRepository,
  ) {}

  async execute(
    organizationId: string,
    farmId: string,
    { id, name, registration, type }: UpdateEmployeeData,
  ) {
    const checkIfEmployeeExists = await this.employeeRepository.findById(
      id,
      organizationId,
      farmId,
    );
    if (!checkIfEmployeeExists) {
      throw new NotFoundException('Employee does not exist');
    }

    if (registration) {
      const duplicate = await this.employeeRepository.findByRegistration(
        organizationId,
        registration,
      );
      if (duplicate && duplicate.id !== id) {
        throw new ConflictException('Registration already exists');
      }
    }

    const employee = await this.employeeRepository.update({
      id,
      name,
      registration,
      type,
    });

    return { employee };
  }
}
