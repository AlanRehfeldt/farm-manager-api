import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  USER_REPOSITORY,
  UserRepository,
} from '../repositories/user.repository';
import { UpdateUserData } from '../repositories/@types';
import {
  EMPLOYEE_REPOSITORY,
  EmployeeRepository,
} from 'src/modules/employee/repositories/employee.repository';

@Injectable()
export class UpdateUserService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    @Inject(EMPLOYEE_REPOSITORY)
    private readonly employeeRepository: EmployeeRepository,
  ) {}

  async execute({ id, name, email, role, employeeId }: UpdateUserData) {
    if (email) {
      const checkIfEmailExists = await this.userRepository.findByEmail(email);
      if (checkIfEmailExists) {
        throw new ConflictException('Email already exists');
      }
    }

    if (employeeId) {
      const checkIfEmployeeExists =
        await this.employeeRepository.findById(employeeId);
      if (!checkIfEmployeeExists) {
        throw new NotFoundException('Employee does not exists');
      }
    }

    const user = await this.userRepository.update({
      id,
      name,
      email,
      role,
      employeeId,
    });

    return { user: { ...user, password: undefined } };
  }
}
