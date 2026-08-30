import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { assertSelfOrPlatformAdmin } from 'src/common/platform/assert-self-or-platform-admin';
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
    private readonly prisma: PrismaService,
  ) {}

  async execute(
    actorUserId: string,
    { id, name, email, employeeId }: UpdateUserData,
  ) {
    await assertSelfOrPlatformAdmin(this.prisma, actorUserId, id);

    const checkIfUserExists = await this.userRepository.findById(id);
    if (!checkIfUserExists) {
      throw new NotFoundException('User does not exist');
    }

    if (email) {
      const checkIfEmailExists = await this.userRepository.findByEmail(email);
      if (checkIfEmailExists && checkIfEmailExists.id !== id) {
        throw new ConflictException('Email already exists');
      }
    }

    if (employeeId) {
      const checkIfEmployeeExists =
        await this.employeeRepository.findById(employeeId);
      if (!checkIfEmployeeExists) {
        throw new NotFoundException('Employee does not exist');
      }
    }

    const user = await this.userRepository.update({
      id,
      name,
      email,
      employeeId,
    });

    return { user: { ...user, password: undefined } };
  }
}
