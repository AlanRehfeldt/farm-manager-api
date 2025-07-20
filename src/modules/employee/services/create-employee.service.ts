import { ConflictException, Inject, Injectable } from '@nestjs/common';
import {
  EMPLOYEE_REPOSITORY,
  EmployeeRepository,
} from '../repositories/employee.repository';
import { CreateEmployeeData } from '../repositories/@types';

@Injectable()
export class CreateEmployeeService {
  constructor(
    @Inject(EMPLOYEE_REPOSITORY)
    private readonly employeeRepository: EmployeeRepository,
  ) {}

  async execute({ name, registration, type }: CreateEmployeeData) {
    const checkIfRegistrationExists =
      await this.employeeRepository.findByRegistration(registration);
    if (checkIfRegistrationExists) {
      throw new ConflictException('Registration already exists');
    }

    const employee = await this.employeeRepository.create({
      name,
      registration,
      type,
    });

    return { employee };
  }
}
