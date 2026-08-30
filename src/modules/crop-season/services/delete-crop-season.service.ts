import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  CROP_SEASON_REPOSITORY,
  CropSeasonRepository,
} from '../repositories/crop-season.repository';

@Injectable()
export class DeleteCropSeasonService {
  constructor(
    @Inject(CROP_SEASON_REPOSITORY)
    private readonly cropSeasonRepository: CropSeasonRepository,
  ) {}

  async execute(id: string, farmId: string) {
    const existing = await this.cropSeasonRepository.findById(id, farmId);
    if (!existing) {
      throw new NotFoundException('Crop season does not exist');
    }

    await this.cropSeasonRepository.delete(id);
  }
}
