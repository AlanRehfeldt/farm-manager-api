import {
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Role } from '@prisma/client';
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
  ) {}

  async execute(userId: string, input: CreateOnboardingInput) {
    const memberships = await this.membershipRepository.findManyByUser(userId);

    if (memberships.length === 0) {
      throw new ConflictException(
        'Organization must be provisioned by the platform',
      );
    }

    const organizationIds = [
      ...new Set(memberships.map((membership) => membership.organizationId)),
    ];

    if (organizationIds.length !== 1) {
      throw new ConflictException('User belongs to more than one organization');
    }

    const organizationId = organizationIds[0];
    if (!organizationId) {
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
