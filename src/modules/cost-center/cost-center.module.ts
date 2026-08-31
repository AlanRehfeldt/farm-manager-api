import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/common/prisma/prisma.module';
import { PrismaCostCenterRepository } from './repositories/prisma-cost-center.repository';
import { COST_CENTER_REPOSITORY } from './repositories/cost-center.repository';
import { CreateCostCenterController } from './controllers/create-cost-center.controller';
import { CreateCostCenterService } from './services/create-cost-center.service';
import { UpdateCostCenterController } from './controllers/update-cost-center.controller';
import { DeleteCostCenterController } from './controllers/delete-cost-center.controller';
import { GetCostCenterController } from './controllers/get-cost-center.controller';
import { FetchCostCentersController } from './controllers/fetch-cost-centers.controller';
import { UpdateCostCenterService } from './services/update-cost-center.service';
import { DeleteCostCenterService } from './services/delete-cost-center.service';
import { GetCostCenterService } from './services/get-cost-center.service';
import { FetchCostCentersService } from './services/fetch-cost-center.service';

@Module({
  imports: [PrismaModule],
  controllers: [
    CreateCostCenterController,
    UpdateCostCenterController,
    DeleteCostCenterController,
    GetCostCenterController,
    FetchCostCentersController,
  ],
  providers: [
    {
      provide: COST_CENTER_REPOSITORY,
      useClass: PrismaCostCenterRepository,
    },
    CreateCostCenterService,
    UpdateCostCenterService,
    DeleteCostCenterService,
    GetCostCenterService,
    FetchCostCentersService,
  ],
  exports: [COST_CENTER_REPOSITORY],
})
export class CostCenterModule {}
