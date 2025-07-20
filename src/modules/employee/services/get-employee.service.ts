import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  EMPLOYEE_REPOSITORY,
  EmployeeRepository,
} from '../repositories/employee.repository';

@Injectable()
export class GetEmployeeService {
  constructor(
    @Inject(EMPLOYEE_REPOSITORY)
    private readonly employeeRepository: EmployeeRepository,
  ) {}

  async execute(id: string) {
    const employee = await this.employeeRepository.findById(id);

    if (!employee) {
      throw new NotFoundException('Employee does not exist');
    }

    return { employee };
  }
}
