import { Inject, Injectable } from '@nestjs/common';
import { SearchPlatformOrganizationsQuery } from '../repositories/@types';
import {
  PLATFORM_REPOSITORY,
  PlatformRepository,
} from '../repositories/platform.repository';

@Injectable()
export class FetchPlatformOrganizationsService {
  constructor(
    @Inject(PLATFORM_REPOSITORY)
    private readonly platformRepository: PlatformRepository,
  ) {}

  async execute(query: SearchPlatformOrganizationsQuery) {
    const [results, total] = await Promise.all([
      this.platformRepository.searchOrganizations(query),
      this.platformRepository.countOrganizations(query),
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
