import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { OrganizationSelection, PlatformRole } from '@prisma/client';
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
import { AuthenticatedUser } from '../decorators/current-user.decorator';
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

  async execute(actor: AuthenticatedUser): Promise<MeResultDto> {
    const user = await this.userRepository.findById(actor.userId);

    if (!user) {
      throw new NotFoundException('User does not exist');
    }

    const memberships = await this.membershipRepository.findManyByUser(
      actor.userId,
    );
    const visibleMemberships =
      actor.organizationSelection === OrganizationSelection.BOUND &&
      actor.organizationId
        ? memberships.filter(
            (membership) => membership.organizationId === actor.organizationId,
          )
        : memberships;
    const activeOrganizations =
      actor.organizationSelection === OrganizationSelection.PENDING ||
      actor.organizationSelection === OrganizationSelection.BOUND
        ? await this.membershipRepository.listActiveOrganizationsByUser(
            actor.userId,
          )
        : [];
    const supportAccesses =
      user.platformRole === PlatformRole.PLATFORM_SUPPORT
        ? await this.platformRepository.listActiveSupportAccess(actor.userId)
        : [];
    const { password, passwordChangedAt, ...userWithoutPassword } = user;
    void password;
    void passwordChangedAt;

    const organizationName =
      actor.organizationSelection === OrganizationSelection.BOUND
        ? (activeOrganizations.find(
            (organization) => organization.id === actor.organizationId,
          )?.name ?? null)
        : null;

    return new MeResultDto({
      ...userWithoutPassword,
      employeeId: userWithoutPassword.employeeId ?? undefined,
      memberships: visibleMemberships,
      supportAccesses,
      organizationSelection: actor.organizationSelection,
      organizationId: actor.organizationId,
      organizationName,
      organizations:
        actor.organizationSelection === OrganizationSelection.PENDING
          ? activeOrganizations
          : [],
    });
  }
}
