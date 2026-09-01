import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/common/prisma/prisma.module';
import { CloseCropSeasonController } from './controllers/close-crop-season.controller';
import { ExportCropSeasonCostingController } from './controllers/export-crop-season-costing.controller';
import { GetCropSeasonCostingController } from './controllers/get-crop-season-costing.controller';
import { ReopenCropSeasonController } from './controllers/reopen-crop-season.controller';
import { UpdateReferencePriceController } from './controllers/update-reference-price.controller';
import { PrismaCostingRepository } from './repositories/prisma-costing.repository';
import { COSTING_REPOSITORY } from './repositories/costing.repository';
import { CloseCropSeasonService } from './services/close-crop-season.service';
import { ExportCropSeasonCostingService } from './services/export-crop-season-costing.service';
import { GetCropSeasonCostingService } from './services/get-crop-season-costing.service';
import { ReopenCropSeasonService } from './services/reopen-crop-season.service';
import { UpdateReferencePriceService } from './services/update-reference-price.service';

@Module({
  imports: [PrismaModule],
  controllers: [
    GetCropSeasonCostingController,
    ExportCropSeasonCostingController,
    UpdateReferencePriceController,
    CloseCropSeasonController,
    ReopenCropSeasonController,
  ],
  providers: [
    {
      provide: COSTING_REPOSITORY,
      useClass: PrismaCostingRepository,
    },
    GetCropSeasonCostingService,
    ExportCropSeasonCostingService,
    UpdateReferencePriceService,
    CloseCropSeasonService,
    ReopenCropSeasonService,
  ],
})
export class CostingModule {}
