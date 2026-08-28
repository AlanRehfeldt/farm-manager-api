import { Module, forwardRef } from '@nestjs/common';
import { PrismaModule } from 'src/common/prisma/prisma.module';
import { MembershipModule } from '../membership/membership.module';
import { CreateFarmController } from './controllers/create-farm.controller';
import { FetchFarmsController } from './controllers/fetch-farms.controller';
import { GetFarmController } from './controllers/get-farm.controller';
import { UpdateFarmController } from './controllers/update-farm.controller';
import { FARM_REPOSITORY } from './repositories/farm.repository';
import { PrismaFarmRepository } from './repositories/prisma-farm.repository';
import { CreateFarmService } from './services/create-farm.service';
import { FetchFarmsService } from './services/fetch-farms.service';
import { GetFarmService } from './services/get-farm.service';
import { UpdateFarmService } from './services/update-farm.service';

@Module({
  imports: [PrismaModule, forwardRef(() => MembershipModule)],
  controllers: [
    CreateFarmController,
    FetchFarmsController,
    GetFarmController,
    UpdateFarmController,
  ],
  providers: [
    {
      provide: FARM_REPOSITORY,
      useClass: PrismaFarmRepository,
    },
    CreateFarmService,
    GetFarmService,
    FetchFarmsService,
    UpdateFarmService,
  ],
  exports: [FARM_REPOSITORY],
})
export class FarmModule {}
