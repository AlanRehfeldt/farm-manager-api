import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { assertSelfOrPlatformAdmin } from 'src/common/platform/assert-self-or-platform-admin';
import {
  USER_REPOSITORY,
  UserRepository,
} from '../repositories/user.repository';

@Injectable()
export class DeleteUserService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    private readonly prisma: PrismaService,
  ) {}

  async execute(actorUserId: string, id: string) {
    await assertSelfOrPlatformAdmin(this.prisma, actorUserId, id);

    const checkIfUserExists = await this.userRepository.findById(id);
    if (!checkIfUserExists) {
      throw new NotFoundException('User does not exist');
    }

    return await this.userRepository.delete(id);
  }
}
