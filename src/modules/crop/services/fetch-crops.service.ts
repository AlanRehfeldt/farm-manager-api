import { Inject, Injectable } from '@nestjs/common';
import { toCropResponse } from '../mappers/crop.mapper';
import {
  CROP_REPOSITORY,
  CropRepository,
} from '../repositories/crop.repository';
import { SearchManyCropsQuery } from '../repositories/@types';

@Injectable()
export class FetchCropsService {
  constructor(
    @Inject(CROP_REPOSITORY)
    private readonly cropRepository: CropRepository,
  ) {}

  async execute(query: SearchManyCropsQuery) {
    const [crops, total] = await Promise.all([
      this.cropRepository.searchMany(query),
      this.cropRepository.count(query),
    ]);

    return {
      results: crops.map(toCropResponse),
      total,
      page: query.page,
      perPage: query.perPage,
      orderBy: query.orderBy,
      orderDirection: query.orderDirection,
    };
  }
}
