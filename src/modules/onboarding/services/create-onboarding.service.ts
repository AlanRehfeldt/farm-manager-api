import {
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PlatformRole, Role } from '@prisma/client';
import {
  FARM_REPOSITORY,
  FarmRepository,
} from 'src/modules/farm/repositories/farm.repository';
import {
  MEMBERSHIP_REPOSITORY,
  MembershipRepository,
} from 'src/modules/membership/repositories/membership.repository';
import {
  ORGANIZATION_REPOSITORY,
  OrganizationRepository,
} from 'src/modules/organization/repositories/organization.repository';
import {
  USER_REPOSITORY,
  UserRepository,
} from 'src/modules/user/repositories/user.repository';

type CreateOnboardingInput = {
  farmName: string;
  timezone?: string;
};

@Injectable()
export class CreateOnboardingService {
  constructor(
    @Inject(ORGANIZATION_REPOSITORY)
    private readonly organizationRepository: OrganizationRepository,
    @Inject(MEMBERSHIP_REPOSITORY)
    private readonly membershipRepository: MembershipRepository,
    @Inject(FARM_REPOSITORY)
    private readonly farmRepository: FarmRepository,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {}

  async execute(
    userId: string,
    input: CreateOnboardingInput,
    organizationId: string | null,
  ) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User does not exist');
    }

    if (user.platformRole !== PlatformRole.NONE) {
      throw new ForbiddenException(
        'Platform users cannot create a farm through onboarding',
      );
    }

    if (!organizationId) {
      throw new ConflictException(
        'Organization must be provisioned by the platform',
      );
    }

    const memberships = (
      await this.membershipRepository.findManyByUser(userId)
    ).filter((membership) => membership.organizationId === organizationId);

    if (memberships.length === 0) {
      throw new ConflictException(
        'Organization must be provisioned by the platform',
      );
    }

    const isOrgAdmin = memberships.some(
      (membership) =>
        membership.organizationId === organizationId &&
        membership.role === Role.ADMIN &&
        membership.farmId === null,
    );

    if (!isOrgAdmin) {
      throw new ForbiddenException(
        'Only organization admins can create the first farm',
      );
    }

    const farmCount =
      await this.farmRepository.countByOrganization(organizationId);

    if (farmCount > 0) {
      throw new ConflictException('Organization already has a farm');
    }

    const farm = await this.farmRepository.create({
      organizationId,
      name: input.farmName,
      timezone: input.timezone,
    });

    const organization = await this.organizationRepository.findByIdForUser(
      organizationId,
      userId,
    );

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    return { organization, farm };
  }
}
