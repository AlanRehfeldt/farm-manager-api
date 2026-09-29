import { Inject, Injectable } from '@nestjs/common';
import { SearchAuditLogsQuery } from '../repositories/@types';
import {
  PLATFORM_REPOSITORY,
  PlatformRepository,
} from '../repositories/platform.repository';

@Injectable()
export class FetchAuditLogsService {
  constructor(
    @Inject(PLATFORM_REPOSITORY)
    private readonly platformRepository: PlatformRepository,
  ) {}

  async execute(query: SearchAuditLogsQuery) {
    const [results, total] = await Promise.all([
      this.platformRepository.searchAuditLogs(query),
      this.platformRepository.countAuditLogs(query),
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
