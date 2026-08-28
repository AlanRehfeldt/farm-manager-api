import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  COST_CENTER_REPOSITORY,
  CostCenterRepository,
} from '../repositories/cost-center.repository';

@Injectable()
export class GetCostCenterService {
  constructor(
    @Inject(COST_CENTER_REPOSITORY)
    private readonly costCenterRepository: CostCenterRepository,
  ) {}

  async execute(id: string, organizationId: string) {
    const costCenter = await this.costCenterRepository.findById(
      id,
      organizationId,
    );

    if (!costCenter) {
      throw new NotFoundException('Cost center does not exist');
    }

    return { costCenter };
  }
}
