import { Inject, Injectable } from '@nestjs/common';
import { COST_CATEGORY_SEED } from '../constants/cost-category-seed';
import {
  COST_CATEGORY_REPOSITORY,
  CostCategoryRepository,
} from '../repositories/cost-category.repository';

@Injectable()
export class SeedCostCategoriesService {
  constructor(
    @Inject(COST_CATEGORY_REPOSITORY)
    private readonly costCategoryRepository: CostCategoryRepository,
  ) {}

  async execute(organizationId: string) {
    const results = await Promise.all(
      COST_CATEGORY_SEED.map((entry) =>
        this.costCategoryRepository.upsertSeed(
          organizationId,
          entry.code,
          entry.name,
        ),
      ),
    );

    return { categories: results };
  }
}
