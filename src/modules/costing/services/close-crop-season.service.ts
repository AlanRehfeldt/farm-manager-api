import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CropSeasonStatus } from '@prisma/client';
import {
  LABOR_CLOSING_REPOSITORY,
  LaborClosingRepository,
} from 'src/modules/labor-closing/repositories/labor-closing.repository';
import {
  COSTING_REPOSITORY,
  CostingRepository,
} from '../repositories/costing.repository';

@Injectable()
export class CloseCropSeasonService {
  constructor(
    @Inject(COSTING_REPOSITORY)
    private readonly costingRepository: CostingRepository,
    @Inject(LABOR_CLOSING_REPOSITORY)
    private readonly laborClosingRepository: LaborClosingRepository,
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

    const openLaborMonths =
      await this.laborClosingRepository.findOpenCltLaborMonthsForSeason(
        cropSeasonId,
      );

    if (openLaborMonths.length > 0) {
      const list = openLaborMonths
        .map((m) => `${String(m.month).padStart(2, '0')}/${m.year}`)
        .join(', ');
      throw new ConflictException(
        `Cannot close crop season while CLT labor months are open: ${list}`,
      );
    }

    const payload = await this.costingRepository.closeSeason({
      cropSeasonId,
      farmId,
      closedByUserId,
    });

    return {
      costing: {
        ...payload,
        openLaborMonths: payload.openLaborMonths ?? [],
      },
    };
  }
}
