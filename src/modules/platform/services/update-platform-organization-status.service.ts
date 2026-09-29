import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { OrganizationStatus } from '@prisma/client';
import {
  PLATFORM_REPOSITORY,
  PlatformRepository,
} from '../repositories/platform.repository';

@Injectable()
export class UpdatePlatformOrganizationStatusService {
  constructor(
    @Inject(PLATFORM_REPOSITORY)
    private readonly platformRepository: PlatformRepository,
  ) {}

  async execute(organizationId: string, status: OrganizationStatus) {
    const organization = await this.platformRepository.updateOrganizationStatus(
      organizationId,
      status,
    );

    if (!organization) {
      throw new NotFoundException('Organization does not exist');
    }

    return {
      id: organization.id,
      name: organization.name,
      status: organization.status,
    };
  }
}
