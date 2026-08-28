import { Inject, Injectable } from '@nestjs/common';
import { SearchManyQuery } from '../repositories/@types';
import {
  FARM_REPOSITORY,
  FarmRepository,
} from '../repositories/farm.repository';

@Injectable()
export class FetchFarmsService {
  constructor(
    @Inject(FARM_REPOSITORY)
    private readonly farmRepository: FarmRepository,
  ) {}

  async execute(userId: string, params: SearchManyQuery) {
    const results = await this.farmRepository.searchAccessibleByUser(
      userId,
      params,
    );
    const total = await this.farmRepository.countAccessibleByUser(
      userId,
      params,
    );

    return {
      results,
      total,
      page: params.page,
      perPage: params.perPage,
      orderBy: params.orderBy,
      orderDirection: params.orderDirection,
    };
  }
}
