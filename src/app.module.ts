import { Module } from '@nestjs/common';
import { UserModule } from './modules/user/user.module';
import { PrismaModule } from './common/prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { envSchema } from './env';
import { EmployeeModule } from './modules/employee/employee.module';
import { SupplierModule } from './modules/supplier/supplier.module';
import { CostCenterModule } from './modules/cost-center/cost-center.module';
import { AccountPlanModule } from './modules/account-plan/account-plan.module';
import { InstallmentModule } from './modules/installment/installment.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      validate: (env) => envSchema.parse(env),
      isGlobal: true,
    }),
    PrismaModule,
    UserModule,
    EmployeeModule,
    SupplierModule,
    CostCenterModule,
    AccountPlanModule,
    InstallmentModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
