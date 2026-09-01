import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CropSeasonStatus } from '@prisma/client';
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

    if (existing.status === CropSeasonStatus.CLOSED) {
      throw new ConflictException('Closed crop season cannot be deleted');
    }

    const hasOperationalData =
      await this.cropSeasonRepository.hasOperationalData(id);

    if (hasOperationalData) {
      throw new ConflictException(
        'Crop season with operational data cannot be deleted',
      );
    }

    await this.cropSeasonRepository.delete(id);
  }
}
