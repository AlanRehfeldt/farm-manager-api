import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  EMPLOYEE_REPOSITORY,
  EmployeeRepository,
} from '../repositories/employee.repository';
import { UpdateEmployeeData } from '../repositories/@types';

@Injectable()
export class UpdateEmployeeService {
  constructor(
    @Inject(EMPLOYEE_REPOSITORY)
    private readonly employeeRepository: EmployeeRepository,
  ) {}

  async execute({ id, name, registration, type }: UpdateEmployeeData) {
    const checkIfEmployeeExists = await this.employeeRepository.findById(id);
    if (!checkIfEmployeeExists) {
      throw new NotFoundException('Employee does not exist');
    }

    if (registration) {
      const checkIfRegistrationExists =
        await this.employeeRepository.findByRegistration(registration);
      if (checkIfRegistrationExists) {
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
