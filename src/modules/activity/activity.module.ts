import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/common/prisma/prisma.module';
import { CostCategoryModule } from 'src/modules/cost-category/cost-category.module';
import { CropSeasonModule } from 'src/modules/crop-season/crop-season.module';
import { EmployeeModule } from 'src/modules/employee/employee.module';
import { FieldModule } from 'src/modules/field/field.module';
import { MachineModule } from 'src/modules/machine/machine.module';
import { ProductModule } from 'src/modules/product/product.module';
import { UnitOfMeasurementModule } from 'src/modules/unit-of-measurement/unit-of-measurement.module';
import { CreateActivityController } from './controllers/create-activity.controller';
import { FetchActivitiesController } from './controllers/fetch-activities.controller';
import { GetActivityController } from './controllers/get-activity.controller';
import { PrismaActivityRepository } from './repositories/prisma-activity.repository';
import { ACTIVITY_REPOSITORY } from './repositories/activity.repository';
import { CreateActivityService } from './services/create-activity.service';
import { FetchActivitiesService } from './services/fetch-activities.service';
import { GetActivityService } from './services/get-activity.service';

@Module({
  imports: [
    PrismaModule,
    CropSeasonModule,
    FieldModule,
    ProductModule,
    UnitOfMeasurementModule,
    CostCategoryModule,
    EmployeeModule,
    MachineModule,
  ],
  controllers: [
    CreateActivityController,
    FetchActivitiesController,
    GetActivityController,
  ],
  providers: [
    {
      provide: ACTIVITY_REPOSITORY,
      useClass: PrismaActivityRepository,
    },
    CreateActivityService,
    FetchActivitiesService,
    GetActivityService,
  ],
})
export class ActivityModule {}
