import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PlatformRole } from '@prisma/client';
import {
  MEMBERSHIP_REPOSITORY,
  MembershipRepository,
} from 'src/modules/membership/repositories/membership.repository';
import {
  PLATFORM_REPOSITORY,
  PlatformRepository,
} from 'src/modules/platform/repositories/platform.repository';
import {
  USER_REPOSITORY,
  UserRepository,
} from 'src/modules/user/repositories/user.repository';
import { MeResultDto } from '../dtos/response/me-result.dto';

@Injectable()
export class MeService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    @Inject(MEMBERSHIP_REPOSITORY)
    private readonly membershipRepository: MembershipRepository,
    @Inject(PLATFORM_REPOSITORY)
    private readonly platformRepository: PlatformRepository,
  ) {}

  async execute(userId: string): Promise<MeResultDto> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new NotFoundException('User does not exist');
    }

    const memberships = await this.membershipRepository.findManyByUser(userId);
    const supportAccesses =
      user.platformRole === PlatformRole.PLATFORM_SUPPORT
        ? await this.platformRepository.listActiveSupportAccess(userId)
        : [];
    const { password, passwordChangedAt, ...userWithoutPassword } = user;
    void password;
    void passwordChangedAt;

    return new MeResultDto({
      ...userWithoutPassword,
      employeeId: userWithoutPassword.employeeId ?? undefined,
      memberships,
      supportAccesses,
    });
  }
}
