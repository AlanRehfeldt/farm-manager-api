import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/common/prisma/prisma.module';
import { UnitOfMeasurementModule } from '../unit-of-measurement/unit-of-measurement.module';
import { CreateCropController } from './controllers/create-crop.controller';
import { DeleteCropController } from './controllers/delete-crop.controller';
import { FetchCropsController } from './controllers/fetch-crops.controller';
import { GetCropController } from './controllers/get-crop.controller';
import { UpdateCropController } from './controllers/update-crop.controller';
import { CreateVarietyController } from './controllers/create-variety.controller';
import { DeleteVarietyController } from './controllers/delete-variety.controller';
import { FetchVarietiesController } from './controllers/fetch-varieties.controller';
import { GetVarietyController } from './controllers/get-variety.controller';
import { UpdateVarietyController } from './controllers/update-variety.controller';
import { PrismaCropRepository } from './repositories/prisma-crop.repository';
import { PrismaVarietyRepository } from './repositories/prisma-variety.repository';
import { CROP_REPOSITORY } from './repositories/crop.repository';
import { VARIETY_REPOSITORY } from './repositories/variety.repository';
import { CreateCropService } from './services/create-crop.service';
import { DeleteCropService } from './services/delete-crop.service';
import { FetchCropsService } from './services/fetch-crops.service';
import { GetCropService } from './services/get-crop.service';
import { UpdateCropService } from './services/update-crop.service';
import { CreateVarietyService } from './services/create-variety.service';
import { DeleteVarietyService } from './services/delete-variety.service';
import { FetchVarietiesService } from './services/fetch-varieties.service';
import { GetVarietyService } from './services/get-variety.service';
import { UpdateVarietyService } from './services/update-variety.service';

@Module({
  imports: [PrismaModule, UnitOfMeasurementModule],
  controllers: [
    CreateCropController,
    GetCropController,
    FetchCropsController,
    UpdateCropController,
    DeleteCropController,
    CreateVarietyController,
    GetVarietyController,
    FetchVarietiesController,
    UpdateVarietyController,
    DeleteVarietyController,
  ],
  providers: [
    { provide: CROP_REPOSITORY, useClass: PrismaCropRepository },
    { provide: VARIETY_REPOSITORY, useClass: PrismaVarietyRepository },
    CreateCropService,
    GetCropService,
    FetchCropsService,
    UpdateCropService,
    DeleteCropService,
    CreateVarietyService,
    GetVarietyService,
    FetchVarietiesService,
    UpdateVarietyService,
    DeleteVarietyService,
  ],
  exports: [CROP_REPOSITORY, VARIETY_REPOSITORY],
})
export class CropModule {}
