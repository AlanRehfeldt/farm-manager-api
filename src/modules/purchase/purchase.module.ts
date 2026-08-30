import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/common/prisma/prisma.module';
import { ProductModule } from '../product/product.module';
import { SupplierModule } from '../supplier/supplier.module';
import { UnitOfMeasurementModule } from '../unit-of-measurement/unit-of-measurement.module';
import { CreatePurchaseController } from './controllers/create-purchase.controller';
import { FetchPurchasesController } from './controllers/fetch-purchases.controller';
import { GetPurchaseController } from './controllers/get-purchase.controller';
import { PrismaPurchaseRepository } from './repositories/prisma-purchase.repository';
import { PURCHASE_REPOSITORY } from './repositories/purchase.repository';
import { CreatePurchaseService } from './services/create-purchase.service';
import { FetchPurchasesService } from './services/fetch-purchases.service';
import { GetPurchaseService } from './services/get-purchase.service';

@Module({
  imports: [
    PrismaModule,
    ProductModule,
    SupplierModule,
    UnitOfMeasurementModule,
  ],
  controllers: [
    CreatePurchaseController,
    FetchPurchasesController,
    GetPurchaseController,
  ],
  providers: [
    {
      provide: PURCHASE_REPOSITORY,
      useClass: PrismaPurchaseRepository,
    },
    CreatePurchaseService,
    FetchPurchasesService,
    GetPurchaseService,
  ],
})
export class PurchaseModule {}
