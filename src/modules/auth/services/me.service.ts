import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  USER_REPOSITORY,
  UserRepository,
} from 'src/modules/user/repositories/user.repository';
import { UserDto } from 'src/modules/user/dtos/entity/user.entity';

@Injectable()
export class MeService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {}

  async execute(userId: string): Promise<UserDto> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new NotFoundException('User does not exist');
    }

    const { password, ...userWithoutPassword } = user;
    void password;
    return new UserDto({
      ...userWithoutPassword,
      employeeId: userWithoutPassword.employeeId ?? undefined,
    });
  }
}
