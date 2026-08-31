import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { toHarvestResponse } from '../mappers/harvest.mapper';
import {
  HARVEST_REPOSITORY,
  HarvestRepository,
} from '../repositories/harvest.repository';

type GetHarvestInput = {
  id: string;
  farmId: string;
};

@Injectable()
export class GetHarvestService {
  constructor(
    @Inject(HARVEST_REPOSITORY)
    private readonly harvestRepository: HarvestRepository,
  ) {}

  async execute(input: GetHarvestInput) {
    const harvest = await this.harvestRepository.findById(
      input.id,
      input.farmId,
    );
    if (!harvest) {
      throw new NotFoundException('Harvest not found');
    }

    return { harvest: toHarvestResponse(harvest) };
  }
}
