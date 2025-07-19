import { Inject, NotFoundException } from '@nestjs/common';
import {
  EMPLOYEE_REPOSITORY,
  EmployeeRepository,
} from '../employee.repository';

export class GetEmployeeService {
  constructor(
    @Inject(EMPLOYEE_REPOSITORY)
    private readonly employeeRepository: EmployeeRepository,
  ) {}

  async execute(id: string) {
    const employee = await this.employeeRepository.findById(id);

    if (!employee) {
      throw new NotFoundException('Employee does not exists');
    }

    return { employee };
  }
}
