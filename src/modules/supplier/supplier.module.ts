import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/common/prisma/prisma.module';
import { PrismaSupplierRepository } from './repositories/prisma-supplier.repository';
import { SUPPLIER_REPOSITORY } from './repositories/supplier.repository';
import { CreateSupplierController } from './controllers/create-supplier.controller';
import { CreateSupplierService } from './services/create-supplier.service';
import { UpdateSupplierController } from './controllers/update-supplier.controller';
import { DeleteSupplierController } from './controllers/delete-supplier.controller';
import { GetSupplierController } from './controllers/get-supplier.controller';
import { FetchSuppliersController } from './controllers/fetch-supplier.controller';
import { UpdateSupplierService } from './services/update-supplier.service';
import { DeleteSupplierService } from './services/delete-supplier.service';
import { GetSupplierService } from './services/get-supplier.service';
import { FetchSuppliersService } from './services/fetch-supplier.service';

@Module({
  imports: [PrismaModule],
  controllers: [
    CreateSupplierController,
    UpdateSupplierController,
    DeleteSupplierController,
    GetSupplierController,
    FetchSuppliersController,
  ],
  providers: [
    {
      provide: SUPPLIER_REPOSITORY,
      useClass: PrismaSupplierRepository,
    },
    CreateSupplierService,
    UpdateSupplierService,
    DeleteSupplierService,
    GetSupplierService,
    FetchSuppliersService,
  ],
  exports: [],
})
export class SupplierModule {}
