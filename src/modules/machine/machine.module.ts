import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/common/prisma/prisma.module';
import { CreateMachineController } from './controllers/create-machine.controller';
import { DeleteMachineController } from './controllers/delete-machine.controller';
import { FetchMachinesController } from './controllers/fetch-machines.controller';
import { GetMachineController } from './controllers/get-machine.controller';
import { UpdateMachineController } from './controllers/update-machine.controller';
import { PrismaMachineRepository } from './repositories/prisma-machine.repository';
import { MACHINE_REPOSITORY } from './repositories/machine.repository';
import { CreateMachineService } from './services/create-machine.service';
import { DeleteMachineService } from './services/delete-machine.service';
import { FetchMachinesService } from './services/fetch-machines.service';
import { GetMachineService } from './services/get-machine.service';
import { UpdateMachineService } from './services/update-machine.service';

@Module({
  imports: [PrismaModule],
  controllers: [
    CreateMachineController,
    GetMachineController,
    FetchMachinesController,
    UpdateMachineController,
    DeleteMachineController,
  ],
  providers: [
    { provide: MACHINE_REPOSITORY, useClass: PrismaMachineRepository },
    CreateMachineService,
    GetMachineService,
    FetchMachinesService,
    UpdateMachineService,
    DeleteMachineService,
  ],
  exports: [MACHINE_REPOSITORY],
})
export class MachineModule {}
