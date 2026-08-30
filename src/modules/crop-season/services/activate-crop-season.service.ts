import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CropSeasonStatus } from '@prisma/client';
import { toCropSeasonResponse } from '../mappers/crop-season.mapper';
import {
  CROP_SEASON_REPOSITORY,
  CropSeasonRepository,
} from '../repositories/crop-season.repository';

@Injectable()
export class ActivateCropSeasonService {
  constructor(
    @Inject(CROP_SEASON_REPOSITORY)
    private readonly cropSeasonRepository: CropSeasonRepository,
  ) {}

  async execute(id: string, farmId: string) {
    const cropSeason = await this.cropSeasonRepository.findById(id, farmId);
    if (!cropSeason) {
      throw new NotFoundException('Crop season does not exist');
    }

    if (cropSeason.status === CropSeasonStatus.ACTIVE) {
      throw new ConflictException('Crop season is already active');
    }

    if (cropSeason.status === CropSeasonStatus.CLOSED) {
      throw new ConflictException('Closed crop season cannot be activated');
    }

    const plantingCount = await this.cropSeasonRepository.countPlantings(id);
    if (plantingCount === 0) {
      throw new ConflictException(
        'Crop season cannot be activated without plantings',
      );
    }

    const updated = await this.cropSeasonRepository.updateStatus(
      id,
      CropSeasonStatus.ACTIVE,
    );

    return { cropSeason: toCropSeasonResponse(updated) };
  }
}
