import { Inject, Injectable } from '@nestjs/common';
import { SeedCostCategoriesService } from 'src/modules/cost-category/services/seed-cost-categories.service';
import {
  ORGANIZATION_REPOSITORY,
  OrganizationRepository,
} from '../repositories/organization.repository';

@Injectable()
export class CreateOrganizationService {
  constructor(
    @Inject(ORGANIZATION_REPOSITORY)
    private readonly organizationRepository: OrganizationRepository,
    private readonly seedCostCategoriesService: SeedCostCategoriesService,
  ) {}

  async execute(userId: string, name: string) {
    const organization = await this.organizationRepository.createWithOwner({
      name,
      ownerUserId: userId,
    });

    await this.seedCostCategoriesService.execute(organization.id);

    return { organization };
  }
}
