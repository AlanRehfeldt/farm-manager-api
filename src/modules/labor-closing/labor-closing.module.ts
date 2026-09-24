import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/common/prisma/prisma.module';
import { CostCategoryModule } from 'src/modules/cost-category/cost-category.module';
import { CloseLaborMonthClosingController } from './controllers/close-labor-month-closing.controller';
import { PreviewLaborMonthClosingController } from './controllers/preview-labor-month-closing.controller';
import { LABOR_CLOSING_REPOSITORY } from './repositories/labor-closing.repository';
import { PrismaLaborClosingRepository } from './repositories/prisma-labor-closing.repository';
import {
  CloseLaborMonthService,
  PreviewLaborMonthClosingService,
} from './services/labor-month-closing.service';

@Module({
  imports: [PrismaModule, CostCategoryModule],
  controllers: [
    PreviewLaborMonthClosingController,
    CloseLaborMonthClosingController,
  ],
  providers: [
    {
      provide: LABOR_CLOSING_REPOSITORY,
      useClass: PrismaLaborClosingRepository,
    },
    PreviewLaborMonthClosingService,
    CloseLaborMonthService,
  ],
  exports: [LABOR_CLOSING_REPOSITORY],
})
export class LaborClosingModule {}
