import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  EMPLOYEE_REPOSITORY,
  EmployeeRepository,
} from '../repositories/employee.repository';

@Injectable()
export class DeleteEmployeeService {
  constructor(
    @Inject(EMPLOYEE_REPOSITORY)
    private readonly employeeRepository: EmployeeRepository,
  ) {}

  async execute(id: string) {
    const checkIfEmployeeExists = await this.employeeRepository.findById(id);
    if (!checkIfEmployeeExists) {
      throw new NotFoundException('Employee does not exist');
    }

    return await this.employeeRepository.delete(id);
  }
}
