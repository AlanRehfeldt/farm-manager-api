import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CropSeasonStatus } from '@prisma/client';
import {
  COSTING_REPOSITORY,
  CostingRepository,
} from '../repositories/costing.repository';
import { GetCropSeasonCostingService } from './get-crop-season-costing.service';

@Injectable()
export class ReopenCropSeasonService {
  constructor(
    @Inject(COSTING_REPOSITORY)
    private readonly costingRepository: CostingRepository,
    private readonly getCropSeasonCostingService: GetCropSeasonCostingService,
  ) {}

  async execute(
    cropSeasonId: string,
    farmId: string,
    reason: string,
    reopenedByUserId: string,
  ) {
    const context = await this.costingRepository.findSeasonContext(
      cropSeasonId,
      farmId,
    );
    if (!context) {
      throw new NotFoundException('Crop season does not exist');
    }

    if (context.status === CropSeasonStatus.ACTIVE) {
      throw new ConflictException('Crop season is already active');
    }

    if (context.status !== CropSeasonStatus.CLOSED) {
      throw new ConflictException('Only closed crop seasons can be reopened');
    }

    await this.costingRepository.reopenSeason({
      cropSeasonId,
      farmId,
      reason,
      reopenedByUserId,
    });

    return this.getCropSeasonCostingService.execute(cropSeasonId, farmId);
  }
}
