import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { SearchPlatformOrganizationFarmsQuery } from '../repositories/@types';
import {
  PLATFORM_REPOSITORY,
  PlatformRepository,
} from '../repositories/platform.repository';

@Injectable()
export class FetchPlatformOrganizationFarmsService {
  constructor(
    @Inject(PLATFORM_REPOSITORY)
    private readonly platformRepository: PlatformRepository,
  ) {}

  async execute(query: SearchPlatformOrganizationFarmsQuery) {
    const organization = await this.platformRepository.findOrganizationById(
      query.organizationId,
    );

    if (!organization) {
      throw new NotFoundException('Organization does not exist');
    }

    const [results, total] = await Promise.all([
      this.platformRepository.searchOrganizationFarms(query),
      this.platformRepository.countOrganizationFarms(query),
    ]);

    return {
      results,
      total,
      page: query.page,
      perPage: query.perPage,
      orderBy: query.orderBy,
      orderDirection: query.orderDirection,
    };
  }
}
