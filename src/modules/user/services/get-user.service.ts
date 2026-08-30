import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { assertSelfOrPlatformAdmin } from 'src/common/platform/assert-self-or-platform-admin';
import {
  USER_REPOSITORY,
  UserRepository,
} from '../repositories/user.repository';

@Injectable()
export class GetUserService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    private readonly prisma: PrismaService,
  ) {}

  async execute(actorUserId: string, id: string) {
    await assertSelfOrPlatformAdmin(this.prisma, actorUserId, id);

    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new NotFoundException('User does not exist');
    }

    return {
      user: {
        ...user,
        password: undefined,
      },
    };
  }
}
