import {
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PlatformRole, Role } from '@prisma/client';
import {
  USER_REPOSITORY,
  UserRepository,
} from 'src/modules/user/repositories/user.repository';
import {
  MEMBERSHIP_REPOSITORY,
  MembershipRepository,
} from '../repositories/membership.repository';

@Injectable()
export class DeleteOrgUserService {
  constructor(
    @Inject(MEMBERSHIP_REPOSITORY)
    private readonly membershipRepository: MembershipRepository,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {}

  async execute(actorUserId: string, userId: string, organizationId: string) {
    const admin = await this.membershipRepository.findOrgAdmin(
      actorUserId,
      organizationId,
    );

    if (!admin) {
      throw new ForbiddenException(
        'Only organization admins can delete memberships',
      );
    }

    const user = await this.userRepository.findById(userId);
    if (!user || user.platformRole !== PlatformRole.NONE) {
      throw new NotFoundException('User does not exist');
    }

    const existing = await this.membershipRepository.findManyByUserAndOrg(
      userId,
      organizationId,
    );

    if (existing.length === 0) {
      throw new NotFoundException('User does not exist');
    }

    const isOrgAdmin = existing.some(
      (item) => item.role === Role.ADMIN && item.farmId === null,
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

    await this.membershipRepository.deleteManyByUserAndOrg(
      userId,
      organizationId,
    );
  }
}
