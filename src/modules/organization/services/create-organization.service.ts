import { Inject, Injectable } from '@nestjs/common';
import {
  ORGANIZATION_REPOSITORY,
  OrganizationRepository,
} from '../repositories/organization.repository';

@Injectable()
export class CreateOrganizationService {
  constructor(
    @Inject(ORGANIZATION_REPOSITORY)
    private readonly organizationRepository: OrganizationRepository,
  ) {}

  async execute(userId: string, name: string) {
    const organization = await this.organizationRepository.createWithOwner({
      name,
      ownerUserId: userId,
    });

    return { organization };
  }
}
