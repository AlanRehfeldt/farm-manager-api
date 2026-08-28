import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  ORGANIZATION_REPOSITORY,
  OrganizationRepository,
} from '../repositories/organization.repository';

@Injectable()
export class GetOrganizationService {
  constructor(
    @Inject(ORGANIZATION_REPOSITORY)
    private readonly organizationRepository: OrganizationRepository,
  ) {}

  async execute(id: string, userId: string) {
    const organization = await this.organizationRepository.findByIdForUser(
      id,
      userId,
    );

    if (!organization) {
      throw new NotFoundException('Organization does not exist');
    }

    return { organization };
  }
}
