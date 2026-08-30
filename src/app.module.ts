import { Module } from '@nestjs/common';
import { UserModule } from './modules/user/user.module';
import { PrismaModule } from './common/prisma/prisma.module';
import { TenancyModule } from './common/tenancy/tenancy.module';
import { PlatformModule } from './common/platform/platform.module';
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
import { OnboardingModule } from './modules/onboarding/onboarding.module';
import { FieldModule } from './modules/field/field.module';
import { CropModule } from './modules/crop/crop.module';
import { MachineModule } from './modules/machine/machine.module';
import { CropSeasonModule } from './modules/crop-season/crop-season.module';
import { CostCategoryModule } from './modules/cost-category/cost-category.module';
import { PurchaseModule } from './modules/purchase/purchase.module';
import { InventoryModule } from './modules/inventory/inventory.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      validate: (env) => envSchema.parse(env),
      isGlobal: true,
    }),
    PrismaModule,
    TenancyModule,
    PlatformModule,
    AuthModule,
    OrganizationModule,
    FarmModule,
    MembershipModule,
    OnboardingModule,
    UserModule,
    EmployeeModule,
    SupplierModule,
    CostCenterModule,
    AccountPlanModule,
    InstallmentModule,
    TransactionModule,
    UnitOfMeasurementModule,
    ProductModule,
    FieldModule,
    CropModule,
    MachineModule,
    CropSeasonModule,
    CostCategoryModule,
    PurchaseModule,
    InventoryModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
