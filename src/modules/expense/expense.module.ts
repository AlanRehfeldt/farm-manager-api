import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/common/prisma/prisma.module';
import { AccountPlanModule } from '../account-plan/account-plan.module';
import { ActivityModule } from '../activity/activity.module';
import { CostCategoryModule } from '../cost-category/cost-category.module';
import { CostCenterModule } from '../cost-center/cost-center.module';
import { CropSeasonModule } from '../crop-season/crop-season.module';
import { EmployeeModule } from '../employee/employee.module';
import { CreateExpenseController } from './controllers/create-expense.controller';
import { FetchExpensesController } from './controllers/fetch-expenses.controller';
import { GetExpenseController } from './controllers/get-expense.controller';
import { PrismaExpenseRepository } from './repositories/prisma-expense.repository';
import { EXPENSE_REPOSITORY } from './repositories/expense.repository';
import { CreateExpenseService } from './services/create-expense.service';
import { FetchExpensesService } from './services/fetch-expenses.service';
import { GetExpenseService } from './services/get-expense.service';

@Module({
  imports: [
    PrismaModule,
    CropSeasonModule,
    CostCenterModule,
    AccountPlanModule,
    CostCategoryModule,
    EmployeeModule,
    ActivityModule,
  ],
  controllers: [
    CreateExpenseController,
    FetchExpensesController,
    GetExpenseController,
  ],
  providers: [
    {
      provide: EXPENSE_REPOSITORY,
      useClass: PrismaExpenseRepository,
    },
    CreateExpenseService,
    FetchExpensesService,
    GetExpenseService,
  ],
})
export class ExpenseModule {}
