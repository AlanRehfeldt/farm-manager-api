import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { forbiddenOrganization } from 'src/common/tenancy/forbidden-organization';
import {
  FARM_REPOSITORY,
  FarmRepository,
} from '../repositories/farm.repository';

@Injectable()
export class GetFarmService {
  constructor(
    @Inject(FARM_REPOSITORY)
    private readonly farmRepository: FarmRepository,
  ) {}

  async execute(
    id: string,
    userId: string,
    sessionOrganizationId: string | null,
  ) {
    const farm = await this.farmRepository.findAccessibleByUser(id, userId);

    if (!farm) {
      throw new NotFoundException('Farm does not exist');
    }

    if (
      sessionOrganizationId &&
      farm.organizationId !== sessionOrganizationId
    ) {
      throw forbiddenOrganization();
    }

    return { farm };
  }
}
