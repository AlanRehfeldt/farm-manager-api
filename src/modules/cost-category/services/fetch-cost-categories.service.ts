import { Inject, Injectable } from '@nestjs/common';
import {
  COST_CATEGORY_REPOSITORY,
  CostCategoryRepository,
} from '../repositories/cost-category.repository';
import { SearchManyQuery } from '../repositories/@types';

@Injectable()
export class FetchCostCategoriesService {
  constructor(
    @Inject(COST_CATEGORY_REPOSITORY)
    private readonly costCategoryRepository: CostCategoryRepository,
  ) {}

  async execute(params: SearchManyQuery) {
    const results = await this.costCategoryRepository.searchMany(params);
    const total = await this.costCategoryRepository.count(params);

    return {
      results,
      total,
      page: params.page,
      perPage: params.perPage,
      orderBy: params.orderBy,
      orderDirection: params.orderDirection,
    };
  }
}
