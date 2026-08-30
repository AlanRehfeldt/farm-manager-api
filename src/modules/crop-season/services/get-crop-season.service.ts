import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { toCropSeasonResponse } from '../mappers/crop-season.mapper';
import {
  CROP_SEASON_REPOSITORY,
  CropSeasonRepository,
} from '../repositories/crop-season.repository';

@Injectable()
export class GetCropSeasonService {
  constructor(
    @Inject(CROP_SEASON_REPOSITORY)
    private readonly cropSeasonRepository: CropSeasonRepository,
  ) {}

  async execute(id: string, farmId: string) {
    const cropSeason = await this.cropSeasonRepository.findById(id, farmId);
    if (!cropSeason) {
      throw new NotFoundException('Crop season does not exist');
    }

    return { cropSeason: toCropSeasonResponse(cropSeason) };
  }
}
