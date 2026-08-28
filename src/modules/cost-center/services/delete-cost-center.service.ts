import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  COST_CENTER_REPOSITORY,
  CostCenterRepository,
} from '../repositories/cost-center.repository';

@Injectable()
export class DeleteCostCenterService {
  constructor(
    @Inject(COST_CENTER_REPOSITORY)
    private readonly costCenterRepository: CostCenterRepository,
  ) {}

  async execute(id: string, organizationId: string) {
    const checkIfCostCenterExists = await this.costCenterRepository.findById(
      id,
      organizationId,
    );
    if (!checkIfCostCenterExists) {
      throw new NotFoundException('Cost center does not exist');
    }

    return await this.costCenterRepository.delete(id);
  }
}
