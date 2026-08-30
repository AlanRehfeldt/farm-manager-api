import { Inject, Injectable } from '@nestjs/common';
import { toCropPlantingResponse } from '../mappers/crop-season.mapper';
import { SearchManyCropPlantingsQuery } from '../repositories/@types';
import {
  CROP_PLANTING_REPOSITORY,
  CropPlantingRepository,
} from '../repositories/crop-planting.repository';

@Injectable()
export class FetchCropPlantingsService {
  constructor(
    @Inject(CROP_PLANTING_REPOSITORY)
    private readonly cropPlantingRepository: CropPlantingRepository,
  ) {}

  async execute(query: SearchManyCropPlantingsQuery) {
    const [cropPlantings, total] = await Promise.all([
      this.cropPlantingRepository.searchMany(query),
      this.cropPlantingRepository.count(query),
    ]);

    return {
      results: cropPlantings.map(toCropPlantingResponse),
      total,
      page: query.page,
      perPage: query.perPage,
      orderBy: query.orderBy,
      orderDirection: query.orderDirection,
    };
  }
}
