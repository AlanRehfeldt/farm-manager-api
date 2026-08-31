import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/common/prisma/prisma.module';
import { PrismaAccountPlanRepository } from './repositories/prisma-account-plan.repository';
import { ACCOUNT_PLAN_REPOSITORY } from './repositories/account-plan.repository';
import { CreateAccountPlanController } from './controllers/create-account-plan.controller';
import { CreateAccountPlanService } from './services/create-account-plan.service';
import { UpdateAccountPlanController } from './controllers/update-account-plan.controller';
import { DeleteAccountPlanController } from './controllers/delete-account-plan.controller';
import { GetAccountPlanController } from './controllers/get-account-plan.controller';
import { FetchAccountPlansController } from './controllers/fetch-account-plan.controller';
import { UpdateAccountPlanService } from './services/update-account-plan.service';
import { DeleteAccountPlanService } from './services/delete-account-plan.service';
import { GetAccountPlanService } from './services/get-account-plan.service';
import { FetchAccountPlansService } from './services/fetch-account-plan.service';

@Module({
  imports: [PrismaModule],
  controllers: [
    CreateAccountPlanController,
    UpdateAccountPlanController,
    DeleteAccountPlanController,
    GetAccountPlanController,
    FetchAccountPlansController,
  ],
  providers: [
    {
      provide: ACCOUNT_PLAN_REPOSITORY,
      useClass: PrismaAccountPlanRepository,
    },
    CreateAccountPlanService,
    UpdateAccountPlanService,
    DeleteAccountPlanService,
    GetAccountPlanService,
    FetchAccountPlansService,
  ],
  exports: [ACCOUNT_PLAN_REPOSITORY],
})
export class AccountPlanModule {}
