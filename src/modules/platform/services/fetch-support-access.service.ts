import { Inject, Injectable } from '@nestjs/common';
import { SearchSupportAccessQuery } from '../repositories/@types';
import {
  PLATFORM_REPOSITORY,
  PlatformRepository,
} from '../repositories/platform.repository';

@Injectable()
export class FetchSupportAccessService {
  constructor(
    @Inject(PLATFORM_REPOSITORY)
    private readonly platformRepository: PlatformRepository,
  ) {}

  async execute(query: SearchSupportAccessQuery) {
    const [results, total] = await Promise.all([
      this.platformRepository.searchSupportAccess(query),
      this.platformRepository.countSupportAccess(query),
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
