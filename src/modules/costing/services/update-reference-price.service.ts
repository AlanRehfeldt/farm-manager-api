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
export class UpdateReferencePriceService {
  constructor(
    @Inject(COSTING_REPOSITORY)
    private readonly costingRepository: CostingRepository,
  ) {}

  async execute(
    cropSeasonId: string,
    farmId: string,
    referenceSalePriceInCents: bigint | null,
  ) {
    const context = await this.costingRepository.findSeasonContext(
      cropSeasonId,
      farmId,
    );
    if (!context) {
      throw new NotFoundException('Crop season does not exist');
    }

    if (context.status === CropSeasonStatus.CLOSED) {
      throw new ConflictException('Closed crop season cannot be updated');
    }

    await this.costingRepository.updateReferencePrice({
      cropSeasonId,
      farmId,
      referenceSalePriceInCents,
    });

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
      referenceSalePriceInCents,
    });

    return {
      costing: toSeasonCostingResponse(
        context.id,
        context.status,
        'LIVE',
        context.productionUomId,
        context.productionUomAcronym,
        computed,
      ),
    };
  }
}
