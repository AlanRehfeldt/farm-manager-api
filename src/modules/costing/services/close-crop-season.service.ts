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

@Injectable()
export class CloseCropSeasonService {
  constructor(
    @Inject(COSTING_REPOSITORY)
    private readonly costingRepository: CostingRepository,
  ) {}

  async execute(cropSeasonId: string, farmId: string, closedByUserId: string) {
    const context = await this.costingRepository.findSeasonContext(
      cropSeasonId,
      farmId,
    );
    if (!context) {
      throw new NotFoundException('Crop season does not exist');
    }

    if (context.status === CropSeasonStatus.CLOSED) {
      throw new ConflictException('Crop season is already closed');
    }

    if (context.status !== CropSeasonStatus.ACTIVE) {
      throw new ConflictException('Only active crop seasons can be closed');
    }

    const payload = await this.costingRepository.closeSeason({
      cropSeasonId,
      farmId,
      closedByUserId,
    });

    return { costing: payload };
  }
}
