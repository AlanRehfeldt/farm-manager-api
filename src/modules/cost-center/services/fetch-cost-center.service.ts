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
    private readonly costcenterRepository: CostCenterRepository,
  ) {}

  async execute(params: SearchManyQuery) {
    const costcenters = await this.costcenterRepository.searchMany(params);
    const total = await this.costcenterRepository.count(params);

    return {
      results: costcenters,
      total,
      page: params.page,
      perPage: params.perPage,
      orderBy: params.orderBy,
      orderDirection: params.orderDirection,
    };
  }
}
