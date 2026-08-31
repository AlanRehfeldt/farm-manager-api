import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/common/prisma/prisma.module';
import { CloseCropSeasonController } from './controllers/close-crop-season.controller';
import { GetCropSeasonCostingController } from './controllers/get-crop-season-costing.controller';
import { UpdateReferencePriceController } from './controllers/update-reference-price.controller';
import { PrismaCostingRepository } from './repositories/prisma-costing.repository';
import { COSTING_REPOSITORY } from './repositories/costing.repository';
import { CloseCropSeasonService } from './services/close-crop-season.service';
import { GetCropSeasonCostingService } from './services/get-crop-season-costing.service';
import { UpdateReferencePriceService } from './services/update-reference-price.service';

@Module({
  imports: [PrismaModule],
  controllers: [
    GetCropSeasonCostingController,
    UpdateReferencePriceController,
    CloseCropSeasonController,
  ],
  providers: [
    {
      provide: COSTING_REPOSITORY,
      useClass: PrismaCostingRepository,
    },
    GetCropSeasonCostingService,
    UpdateReferencePriceService,
    CloseCropSeasonService,
  ],
})
export class CostingModule {}
