import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/common/prisma/prisma.module';
import { TransactionModule } from 'src/modules/transaction/transaction.module';
import { PrismaInstallmentRepository } from './repositories/prisma-installment.repository';
import { INSTALLMENT_REPOSITORY } from './repositories/installment.repository';
import { CreateInstallmentController } from './controllers/create-installment.controller';
import { CreateInstallmentService } from './services/create-installment.service';
import { UpdateInstallmentController } from './controllers/update-installment.controller';
import { DeleteInstallmentController } from './controllers/delete-installment.controller';
import { GetInstallmentController } from './controllers/get-installment.controller';
import { FetchInstallmentsController } from './controllers/fetch-installments.controller';
import { UpdateInstallmentService } from './services/update-installment.service';
import { DeleteInstallmentService } from './services/delete-installment.service';
import { GetInstallmentService } from './services/get-installment.service';
import { FetchInstallmentsService } from './services/fetch-installments.service';

@Module({
  imports: [PrismaModule, TransactionModule],
  controllers: [
    CreateInstallmentController,
    UpdateInstallmentController,
    DeleteInstallmentController,
    GetInstallmentController,
    FetchInstallmentsController,
  ],
  providers: [
    {
      provide: INSTALLMENT_REPOSITORY,
      useClass: PrismaInstallmentRepository,
    },
    CreateInstallmentService,
    UpdateInstallmentService,
    DeleteInstallmentService,
    GetInstallmentService,
    FetchInstallmentsService,
  ],
  exports: [INSTALLMENT_REPOSITORY],
})
export class InstallmentModule {}
