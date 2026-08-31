import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CropSeasonStatus } from '@prisma/client';
import { computeSeasonCosting } from '../domain/compute-season-costing';
import { toSeasonCostingResponse } from '../mappers/costing.mapper';
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

    const [costEntries, plantings, fieldHarvests] = await Promise.all([
      this.costingRepository.findCostEntries(cropSeasonId),
      this.costingRepository.findPlantings(cropSeasonId),
      this.costingRepository.findFieldHarvests(
        farmId,
        cropSeasonId,
        context.productionUomId,
      ),
    ]);

    const computed = computeSeasonCosting({
      costEntries,
      plantings,
      fieldHarvests,
      referenceSalePriceInCents: context.referenceSalePriceInCents,
    });

    const payload = toSeasonCostingResponse(
      context.id,
      CropSeasonStatus.CLOSED,
      'SNAPSHOT',
      context.productionUomId,
      context.productionUomAcronym,
      computed,
      new Date(),
    );

    await this.costingRepository.closeSeason({
      cropSeasonId,
      farmId,
      closedByUserId,
      payload,
    });

    return { costing: payload };
  }
}
