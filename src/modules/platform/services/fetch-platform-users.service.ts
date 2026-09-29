import { Inject, Injectable } from '@nestjs/common';
import { SearchPlatformUsersQuery } from '../repositories/@types';
import {
  PLATFORM_REPOSITORY,
  PlatformRepository,
} from '../repositories/platform.repository';

@Injectable()
export class FetchPlatformUsersService {
  constructor(
    @Inject(PLATFORM_REPOSITORY)
    private readonly platformRepository: PlatformRepository,
  ) {}

  async execute(query: SearchPlatformUsersQuery) {
    const [results, total] = await Promise.all([
      this.platformRepository.searchUsers(query),
      this.platformRepository.countUsers(query),
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
