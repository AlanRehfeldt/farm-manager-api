import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/common/prisma/prisma.module';
import { CostCategoryModule } from 'src/modules/cost-category/cost-category.module';
import { MembershipModule } from 'src/modules/membership/membership.module';
import { CloseLaborMonthClosingController } from './controllers/close-labor-month-closing.controller';
import { PreviewLaborMonthClosingController } from './controllers/preview-labor-month-closing.controller';
import { ReopenLaborMonthClosingController } from './controllers/reopen-labor-month-closing.controller';
import { LABOR_CLOSING_REPOSITORY } from './repositories/labor-closing.repository';
import { PrismaLaborClosingRepository } from './repositories/prisma-labor-closing.repository';
import {
  CloseLaborMonthService,
  PreviewLaborMonthClosingService,
} from './services/labor-month-closing.service';
import { ReopenLaborMonthClosingService } from './services/reopen-labor-month-closing.service';

@Module({
  imports: [PrismaModule, CostCategoryModule, MembershipModule],
  controllers: [
    PreviewLaborMonthClosingController,
    CloseLaborMonthClosingController,
    ReopenLaborMonthClosingController,
  ],
  providers: [
    {
      provide: LABOR_CLOSING_REPOSITORY,
      useClass: PrismaLaborClosingRepository,
    },
    PreviewLaborMonthClosingService,
    CloseLaborMonthService,
    ReopenLaborMonthClosingService,
  ],
  exports: [LABOR_CLOSING_REPOSITORY],
})
export class LaborClosingModule {}
