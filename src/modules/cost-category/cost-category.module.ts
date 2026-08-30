import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/common/prisma/prisma.module';
import { FetchCostCategoriesController } from './controllers/fetch-cost-categories.controller';
import { COST_CATEGORY_REPOSITORY } from './repositories/cost-category.repository';
import { PrismaCostCategoryRepository } from './repositories/prisma-cost-category.repository';
import { FetchCostCategoriesService } from './services/fetch-cost-categories.service';
import { SeedCostCategoriesService } from './services/seed-cost-categories.service';

@Module({
  imports: [PrismaModule],
  controllers: [FetchCostCategoriesController],
  providers: [
    {
      provide: COST_CATEGORY_REPOSITORY,
      useClass: PrismaCostCategoryRepository,
    },
    FetchCostCategoriesService,
    SeedCostCategoriesService,
  ],
  exports: [SeedCostCategoriesService, COST_CATEGORY_REPOSITORY],
})
export class CostCategoryModule {}
