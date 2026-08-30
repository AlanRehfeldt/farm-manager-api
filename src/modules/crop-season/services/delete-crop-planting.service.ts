import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CropSeasonStatus } from '@prisma/client';
import {
  CROP_PLANTING_REPOSITORY,
  CropPlantingRepository,
} from '../repositories/crop-planting.repository';
import {
  CROP_SEASON_REPOSITORY,
  CropSeasonRepository,
} from '../repositories/crop-season.repository';

@Injectable()
export class DeleteCropPlantingService {
  constructor(
    @Inject(CROP_PLANTING_REPOSITORY)
    private readonly cropPlantingRepository: CropPlantingRepository,
    @Inject(CROP_SEASON_REPOSITORY)
    private readonly cropSeasonRepository: CropSeasonRepository,
  ) {}

  async execute(id: string, farmId: string) {
    const existing = await this.cropPlantingRepository.findById(id, farmId);
    if (!existing) {
      throw new NotFoundException('Crop planting does not exist');
    }

    const cropSeason = await this.cropSeasonRepository.findById(
      existing.cropSeasonId,
      farmId,
    );
    if (!cropSeason) {
      throw new NotFoundException('Crop season does not exist');
    }

    if (cropSeason.status === CropSeasonStatus.ACTIVE) {
      const plantingCount = await this.cropPlantingRepository.countBySeasonId(
        existing.cropSeasonId,
      );
      if (plantingCount <= 1) {
        throw new ConflictException(
          'Active crop season must keep at least one planting',
        );
      }
    }

    await this.cropPlantingRepository.delete(id);
  }
}
