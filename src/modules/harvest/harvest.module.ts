import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/common/prisma/prisma.module';
import { CropSeasonModule } from '../crop-season/crop-season.module';
import { CreateHarvestController } from './controllers/create-harvest.controller';
import { FetchHarvestsController } from './controllers/fetch-harvests.controller';
import { GetHarvestController } from './controllers/get-harvest.controller';
import { PrismaHarvestRepository } from './repositories/prisma-harvest.repository';
import { HARVEST_REPOSITORY } from './repositories/harvest.repository';
import { CreateHarvestService } from './services/create-harvest.service';
import { FetchHarvestsService } from './services/fetch-harvests.service';
import { GetHarvestService } from './services/get-harvest.service';

@Module({
  imports: [PrismaModule, CropSeasonModule],
  controllers: [
    CreateHarvestController,
    FetchHarvestsController,
    GetHarvestController,
  ],
  providers: [
    {
      provide: HARVEST_REPOSITORY,
      useClass: PrismaHarvestRepository,
    },
    CreateHarvestService,
    FetchHarvestsService,
    GetHarvestService,
  ],
})
export class HarvestModule {}
