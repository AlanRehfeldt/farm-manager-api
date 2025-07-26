import { Inject, Injectable } from '@nestjs/common';
import {
  COST_CENTER_REPOSITORY,
  CostCenterRepository,
} from '../repositories/cost-center.repository';
import { SearchManyQuery } from '../repositories/@types';

@Injectable()
export class FetchCostCentersService {
  constructor(
    @Inject(COST_CENTER_REPOSITORY)
    private readonly costCenterRepository: CostCenterRepository,
  ) {}

  async execute(params: SearchManyQuery) {
    const costCenters = await this.costCenterRepository.searchMany(params);
    const total = await this.costCenterRepository.count(params);

    return {
      results: costCenters,
      total,
      page: params.page,
      perPage: params.perPage,
      orderBy: params.orderBy,
      orderDirection: params.orderDirection,
    };
  }
}
