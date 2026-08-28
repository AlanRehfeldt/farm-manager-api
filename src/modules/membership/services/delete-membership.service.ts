import {
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import {
  MEMBERSHIP_REPOSITORY,
  MembershipRepository,
} from '../repositories/membership.repository';

@Injectable()
export class DeleteMembershipService {
  constructor(
    @Inject(MEMBERSHIP_REPOSITORY)
    private readonly membershipRepository: MembershipRepository,
  ) {}

  async execute(actorUserId: string, id: string) {
    const membership = await this.membershipRepository.findById(id);

    if (!membership) {
      throw new NotFoundException('Membership does not exist');
    }

    const admin = await this.membershipRepository.findOrgAdmin(
      actorUserId,
      membership.organizationId,
    );

    if (!admin) {
      throw new ForbiddenException(
        'Only organization admins can delete memberships',
      );
    }

    if (membership.role === Role.ADMIN) {
      const adminCount = await this.membershipRepository.countOrgAdmins(
        membership.organizationId,
      );
      if (adminCount <= 1) {
        throw new ConflictException(
          'Cannot remove the last admin of the organization',
        );
      }
    }

    await this.membershipRepository.delete(id);
  }
}
