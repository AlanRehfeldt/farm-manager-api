import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/common/prisma/prisma.module';
import { CropModule } from 'src/modules/crop/crop.module';
import { FieldModule } from 'src/modules/field/field.module';
import { UnitOfMeasurementModule } from 'src/modules/unit-of-measurement/unit-of-measurement.module';
import { ActivateCropSeasonController } from './controllers/activate-crop-season.controller';
import { CreateCropPlantingController } from './controllers/create-crop-planting.controller';
import { CreateCropSeasonController } from './controllers/create-crop-season.controller';
import { DeleteCropPlantingController } from './controllers/delete-crop-planting.controller';
import { DeleteCropSeasonController } from './controllers/delete-crop-season.controller';
import { FetchCropPlantingsController } from './controllers/fetch-crop-plantings.controller';
import { FetchCropSeasonsController } from './controllers/fetch-crop-seasons.controller';
import { GetCropPlantingController } from './controllers/get-crop-planting.controller';
import { GetCropSeasonController } from './controllers/get-crop-season.controller';
import { UpdateCropPlantingController } from './controllers/update-crop-planting.controller';
import { UpdateCropSeasonController } from './controllers/update-crop-season.controller';
import { PrismaCropPlantingRepository } from './repositories/prisma-crop-planting.repository';
import { PrismaCropSeasonRepository } from './repositories/prisma-crop-season.repository';
import { CROP_PLANTING_REPOSITORY } from './repositories/crop-planting.repository';
import { CROP_SEASON_REPOSITORY } from './repositories/crop-season.repository';
import { ActivateCropSeasonService } from './services/activate-crop-season.service';
import { CreateCropPlantingService } from './services/create-crop-planting.service';
import { CreateCropSeasonService } from './services/create-crop-season.service';
import { DeleteCropPlantingService } from './services/delete-crop-planting.service';
import { DeleteCropSeasonService } from './services/delete-crop-season.service';
import { FetchCropPlantingsService } from './services/fetch-crop-plantings.service';
import { FetchCropSeasonsService } from './services/fetch-crop-seasons.service';
import { GetCropPlantingService } from './services/get-crop-planting.service';
import { GetCropSeasonService } from './services/get-crop-season.service';
import { UpdateCropPlantingService } from './services/update-crop-planting.service';
import { UpdateCropSeasonService } from './services/update-crop-season.service';

@Module({
  imports: [PrismaModule, CropModule, FieldModule, UnitOfMeasurementModule],
  controllers: [
    CreateCropSeasonController,
    GetCropSeasonController,
    FetchCropSeasonsController,
    UpdateCropSeasonController,
    DeleteCropSeasonController,
    ActivateCropSeasonController,
    CreateCropPlantingController,
    GetCropPlantingController,
    FetchCropPlantingsController,
    UpdateCropPlantingController,
    DeleteCropPlantingController,
  ],
  providers: [
    { provide: CROP_SEASON_REPOSITORY, useClass: PrismaCropSeasonRepository },
    {
      provide: CROP_PLANTING_REPOSITORY,
      useClass: PrismaCropPlantingRepository,
    },
    CreateCropSeasonService,
    GetCropSeasonService,
    FetchCropSeasonsService,
    UpdateCropSeasonService,
    DeleteCropSeasonService,
    ActivateCropSeasonService,
    CreateCropPlantingService,
    GetCropPlantingService,
    FetchCropPlantingsService,
    UpdateCropPlantingService,
    DeleteCropPlantingService,
  ],
  exports: [CROP_SEASON_REPOSITORY, CROP_PLANTING_REPOSITORY],
})
export class CropSeasonModule {}
