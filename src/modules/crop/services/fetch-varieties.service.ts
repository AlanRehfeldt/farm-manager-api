import { Inject, Injectable } from '@nestjs/common';
import { toVarietyResponse } from '../mappers/variety.mapper';
import { SearchManyVarietiesQuery } from '../repositories/@types';
import {
  VARIETY_REPOSITORY,
  VarietyRepository,
} from '../repositories/variety.repository';

@Injectable()
export class FetchVarietiesService {
  constructor(
    @Inject(VARIETY_REPOSITORY)
    private readonly varietyRepository: VarietyRepository,
  ) {}

  async execute(query: SearchManyVarietiesQuery) {
    const [varieties, total] = await Promise.all([
      this.varietyRepository.searchMany(query),
      this.varietyRepository.count(query),
    ]);

    return {
      results: varieties.map(toVarietyResponse),
      total,
      page: query.page,
      perPage: query.perPage,
      orderBy: query.orderBy,
      orderDirection: query.orderDirection,
    };
  }
}
