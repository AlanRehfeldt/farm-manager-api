import { Inject, Injectable } from '@nestjs/common';
import { SearchSupportUsersQuery } from '../repositories/@types';
import {
  PLATFORM_REPOSITORY,
  PlatformRepository,
} from '../repositories/platform.repository';

@Injectable()
export class FetchSupportUsersService {
  constructor(
    @Inject(PLATFORM_REPOSITORY)
    private readonly platformRepository: PlatformRepository,
  ) {}

  async execute(query: SearchSupportUsersQuery) {
    const [results, total] = await Promise.all([
      this.platformRepository.searchSupportUsers(query),
      this.platformRepository.countSupportUsers(query),
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
