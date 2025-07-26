import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  COST_CENTER_REPOSITORY,
  CostCenterRepository,
} from '../repositories/cost-center.repository';

@Injectable()
export class GetCostCenterService {
  constructor(
    @Inject(COST_CENTER_REPOSITORY)
    private readonly costcenterRepository: CostCenterRepository,
  ) {}

  async execute(id: string) {
    const costcenter = await this.costcenterRepository.findById(id);

    if (!costcenter) {
      throw new NotFoundException('Cost center does not exist');
    }

    return { costcenter };
  }
}
