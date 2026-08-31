import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  CROP_SEASON_REPOSITORY,
  CropSeasonRepository,
} from 'src/modules/crop-season/repositories/crop-season.repository';
import { toHarvestResponse } from '../mappers/harvest.mapper';
import {
  HARVEST_REPOSITORY,
  HarvestRepository,
} from '../repositories/harvest.repository';

type FetchHarvestsInput = {
  farmId: string;
  cropSeasonId: string;
  name?: string;
  page: number;
  perPage: number;
  orderBy: string;
  orderDirection: 'asc' | 'desc';
};

@Injectable()
export class FetchHarvestsService {
  constructor(
    @Inject(HARVEST_REPOSITORY)
    private readonly harvestRepository: HarvestRepository,
    @Inject(CROP_SEASON_REPOSITORY)
    private readonly cropSeasonRepository: CropSeasonRepository,
  ) {}

  async execute(input: FetchHarvestsInput) {
    const cropSeason = await this.cropSeasonRepository.findById(
      input.cropSeasonId,
      input.farmId,
    );
    if (!cropSeason) {
      throw new NotFoundException('Crop season not found');
    }

    const [results, total, totals] = await Promise.all([
      this.harvestRepository.searchMany(input),
      this.harvestRepository.count(input),
      this.harvestRepository.sumSeasonQuantity(
        input.farmId,
        input.cropSeasonId,
        cropSeason.productionUomId,
      ),
    ]);

    return {
      results: results.map(toHarvestResponse),
      total,
      page: input.page,
      perPage: input.perPage,
      orderBy: input.orderBy,
      orderDirection: input.orderDirection,
      harvestedQuantity: totals.harvestedQuantity,
      productionUomId: totals.productionUomId,
    };
  }
}
