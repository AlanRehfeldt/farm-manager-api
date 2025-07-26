import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/common/prisma/prisma.module';
import { PrismaUnitOfMeasurementRepository } from './repositories/prisma-unit-of-measurement.repository';
import { UNIT_OF_MEASUREMENT_REPOSITORY } from './repositories/unit-of-measurement.repository';
import { CreateUnitOfMeasurementController } from './controllers/create-unit-of-measurement.controller';
import { CreateUnitOfMeasurementService } from './services/create-unit-of-measurement.service';
import { UpdateUnitOfMeasurementController } from './controllers/update-unit-of-measurement.controller';
import { DeleteUnitOfMeasurementController } from './controllers/delete-unit-of-measurement.controller';
import { GetUnitOfMeasurementController } from './controllers/get-unit-of-measurement.controller';
import { FetchUnitOfMeasurementsController } from './controllers/fetch-unit-of-measurements.controller';
import { UpdateUnitOfMeasurementService } from './services/update-unit-of-measurement.service';
import { DeleteUnitOfMeasurementService } from './services/delete-unit-of-measurement.service';
import { GetUnitOfMeasurementService } from './services/get-unit-of-measurement.service';
import { FetchUnitOfMeasurementsService } from './services/fetch-unit-of-measurement.service';

@Module({
  imports: [PrismaModule],
  controllers: [
    CreateUnitOfMeasurementController,
    UpdateUnitOfMeasurementController,
    DeleteUnitOfMeasurementController,
    GetUnitOfMeasurementController,
    FetchUnitOfMeasurementsController,
  ],
  providers: [
    {
      provide: UNIT_OF_MEASUREMENT_REPOSITORY,
      useClass: PrismaUnitOfMeasurementRepository,
    },
    CreateUnitOfMeasurementService,
    UpdateUnitOfMeasurementService,
    DeleteUnitOfMeasurementService,
    GetUnitOfMeasurementService,
    FetchUnitOfMeasurementsService,
  ],
  exports: [UNIT_OF_MEASUREMENT_REPOSITORY],
})
export class UnitOfMeasurementModule {}
