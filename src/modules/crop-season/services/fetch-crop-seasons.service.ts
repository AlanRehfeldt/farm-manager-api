import { Inject, Injectable } from '@nestjs/common';
import { toCropSeasonResponse } from '../mappers/crop-season.mapper';
import { SearchManyCropSeasonsQuery } from '../repositories/@types';
import {
  CROP_SEASON_REPOSITORY,
  CropSeasonRepository,
} from '../repositories/crop-season.repository';

@Injectable()
export class FetchCropSeasonsService {
  constructor(
    @Inject(CROP_SEASON_REPOSITORY)
    private readonly cropSeasonRepository: CropSeasonRepository,
  ) {}

  async execute(query: SearchManyCropSeasonsQuery) {
    const [cropSeasons, total] = await Promise.all([
      this.cropSeasonRepository.searchMany(query),
      this.cropSeasonRepository.count(query),
    ]);

    return {
      results: cropSeasons.map(toCropSeasonResponse),
      total,
      page: query.page,
      perPage: query.perPage,
      orderBy: query.orderBy,
      orderDirection: query.orderDirection,
    };
  }
}
