import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PlatformRole, Role } from '@prisma/client';
import {
  MEMBERSHIP_REPOSITORY,
  MembershipRepository,
} from 'src/modules/membership/repositories/membership.repository';
import {
  USER_REPOSITORY,
  UserRepository,
} from 'src/modules/user/repositories/user.repository';
import {
  PLATFORM_REPOSITORY,
  PlatformRepository,
} from '../repositories/platform.repository';

@Injectable()
export class RemovePlatformOrganizationUserService {
  constructor(
    @Inject(PLATFORM_REPOSITORY)
    private readonly platformRepository: PlatformRepository,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    @Inject(MEMBERSHIP_REPOSITORY)
    private readonly membershipRepository: MembershipRepository,
  ) {}

  async execute(actorUserId: string, organizationId: string, userId: string) {
    const user = await this.userRepository.findById(userId);

    if (!user || user.platformRole !== PlatformRole.NONE) {
      throw new NotFoundException('User does not exist');
    }

    const memberships = await this.membershipRepository.findManyByUserAndOrg(
      userId,
      organizationId,
    );

    if (memberships.length === 0) {
      throw new NotFoundException('User does not exist');
    }

    const isOrgAdmin = memberships.some(
      (membership) =>
        membership.role === Role.ADMIN && membership.farmId === null,
    );

    if (isOrgAdmin) {
      const adminCount =
        await this.membershipRepository.countOrgAdmins(organizationId);
      if (adminCount <= 1) {
        throw new ConflictException(
          'Cannot remove the last admin of the organization',
        );
      }
    }

    await this.platformRepository.removeOrganizationMember({
      actorUserId,
      organizationId,
      userId,
      guardLastOrgAdmin: isOrgAdmin,
    });
  }
}
