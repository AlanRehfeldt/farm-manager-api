import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { SeedCostCategoriesService } from 'src/modules/cost-category/services/seed-cost-categories.service';
import {
  MEMBERSHIP_REPOSITORY,
  MembershipRepository,
} from 'src/modules/membership/repositories/membership.repository';
import {
  ORGANIZATION_REPOSITORY,
  OrganizationRepository,
} from '../repositories/organization.repository';

@Injectable()
export class CreateOrganizationService {
  constructor(
    @Inject(ORGANIZATION_REPOSITORY)
    private readonly organizationRepository: OrganizationRepository,
    @Inject(MEMBERSHIP_REPOSITORY)
    private readonly membershipRepository: MembershipRepository,
    private readonly seedCostCategoriesService: SeedCostCategoriesService,
  ) {}

  async execute(userId: string, name: string) {
    const existingMemberships =
      await this.membershipRepository.findManyByUser(userId);

    if (existingMemberships.length > 0) {
      throw new ConflictException('User already belongs to an organization');
    }

    const organization = await this.organizationRepository.createWithOwner({
      name,
      ownerUserId: userId,
    });

    await this.seedCostCategoriesService.execute(organization.id);

    return { organization };
  }
}
