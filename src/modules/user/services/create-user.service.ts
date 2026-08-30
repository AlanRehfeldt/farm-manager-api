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
import { CreateUserData } from '../repositories/@types';
import {
  EMPLOYEE_REPOSITORY,
  EmployeeRepository,
} from 'src/modules/employee/repositories/employee.repository';
import { hash } from 'bcryptjs';

@Injectable()
export class CreateUserService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    @Inject(EMPLOYEE_REPOSITORY)
    private readonly employeeRepository: EmployeeRepository,
  ) {}

  async execute({ name, email, password, role, employeeId }: CreateUserData) {
    const checkIfEmailExists = await this.userRepository.findByEmail(email);
    if (checkIfEmailExists) {
      throw new ConflictException('Email already exists');
    }

    if (employeeId) {
      const checkIfEmployeeExists =
        await this.employeeRepository.findById(employeeId);
      if (!checkIfEmployeeExists) {
        throw new NotFoundException('Employee does not exist');
      }
    }

    const encryptedPassword = await hash(password, 6);

    const user = await this.userRepository.create({
      name,
      email,
      password: encryptedPassword,
      role,
      employeeId,
    });

    return { user: { ...user, password: undefined } };
  }
}
