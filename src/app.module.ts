import { Module } from '@nestjs/common';
import { UserModule } from './modules/user/user.module';
import { PrismaModule } from './common/prisma/prisma.module';
import { TenancyModule } from './common/tenancy/tenancy.module';
import { ConfigModule } from '@nestjs/config';
import { envSchema } from './env';
import { EmployeeModule } from './modules/employee/employee.module';
import { SupplierModule } from './modules/supplier/supplier.module';
import { CostCenterModule } from './modules/cost-center/cost-center.module';
import { AccountPlanModule } from './modules/account-plan/account-plan.module';
import { InstallmentModule } from './modules/installment/installment.module';
import { TransactionModule } from './modules/transaction/transaction.module';
import { UnitOfMeasurementModule } from './modules/unit-of-measurement/unit-of-measurement.module';
import { ProductModule } from './modules/product/product.module';
import { AuthModule } from './modules/auth/auth.module';
import { OrganizationModule } from './modules/organization/organization.module';
import { FarmModule } from './modules/farm/farm.module';
import { MembershipModule } from './modules/membership/membership.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      validate: (env) => envSchema.parse(env),
      isGlobal: true,
    }),
    PrismaModule,
    TenancyModule,
    AuthModule,
    OrganizationModule,
    FarmModule,
    MembershipModule,
    UserModule,
    EmployeeModule,
    SupplierModule,
    CostCenterModule,
    AccountPlanModule,
    InstallmentModule,
    TransactionModule,
    UnitOfMeasurementModule,
    ProductModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
