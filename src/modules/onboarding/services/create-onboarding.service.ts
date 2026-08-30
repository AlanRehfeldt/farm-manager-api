import { ConflictException, Inject, Injectable } from '@nestjs/common';
import {
  MEMBERSHIP_REPOSITORY,
  MembershipRepository,
} from 'src/modules/membership/repositories/membership.repository';
import {
  ORGANIZATION_REPOSITORY,
  OrganizationRepository,
} from 'src/modules/organization/repositories/organization.repository';

type CreateOnboardingInput = {
  organizationName: string;
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
  ) {}

  async execute(userId: string, input: CreateOnboardingInput) {
    const memberships = await this.membershipRepository.findManyByUser(userId);

    if (memberships.length > 0) {
      throw new ConflictException('User already belongs to an organization');
    }

    const { organization, farm } =
      await this.organizationRepository.createWithOwnerAndFirstFarm({
        organizationName: input.organizationName,
        farmName: input.farmName,
        timezone: input.timezone,
        ownerUserId: userId,
      });

    return { organization, farm };
  }
}
