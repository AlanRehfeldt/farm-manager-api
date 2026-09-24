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
import { computeSeasonCosting } from '../domain/compute-season-costing';
import { toSeasonCostingResponse } from '../mappers/costing.mapper';
import {
  COSTING_REPOSITORY,
  CostingRepository,
} from '../repositories/costing.repository';

@Injectable()
export class GetCropSeasonCostingService {
  constructor(
    @Inject(COSTING_REPOSITORY)
    private readonly costingRepository: CostingRepository,
    @Inject(LABOR_CLOSING_REPOSITORY)
    private readonly laborClosingRepository: LaborClosingRepository,
  ) {}

  async execute(cropSeasonId: string, farmId: string) {
    const context = await this.costingRepository.findSeasonContext(
      cropSeasonId,
      farmId,
    );
    if (!context) {
      throw new NotFoundException('Crop season does not exist');
    }

    if (context.status === CropSeasonStatus.CLOSED) {
      const snapshot = await this.costingRepository.findSnapshot(cropSeasonId);
      if (snapshot) {
        return {
          costing: {
            ...snapshot.payload,
            openLaborMonths: snapshot.payload.openLaborMonths ?? [],
          },
        };
      }

      throw new ConflictException(
        'Crop season is closed but costing snapshot is missing',
      );
    }

    const [costEntries, plantings, fieldHarvests, openLaborMonths] =
      await Promise.all([
        this.costingRepository.findCostEntries(cropSeasonId),
        this.costingRepository.findPlantings(cropSeasonId),
        this.costingRepository.findFieldHarvests(
          farmId,
          cropSeasonId,
          context.productionUomId,
        ),
        this.laborClosingRepository.findOpenCltLaborMonthsForSeason(
          cropSeasonId,
        ),
      ]);

    const computed = computeSeasonCosting({
      costEntries,
      plantings,
      fieldHarvests,
      referenceSalePriceInCents: context.referenceSalePriceInCents,
    });

    return {
      costing: toSeasonCostingResponse(
        context.id,
        context.status,
        'LIVE',
        context.productionUomId,
        context.productionUomAcronym,
        computed,
        null,
        openLaborMonths,
      ),
    };
  }
}
