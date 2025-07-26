import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/common/prisma/prisma.module';
import { PrismaProductRepository } from './repositories/prisma-product.repository';
import { PRODUCT_REPOSITORY } from './repositories/product.repository';
import { CreateProductController } from './controllers/create-product.controller';
import { CreateProductService } from './services/create-product.service';
import { UpdateProductController } from './controllers/update-product.controller';
import { DeleteProductController } from './controllers/delete-product.controller';
import { GetProductController } from './controllers/get-product.controller';
import { FetchProductsController } from './controllers/fetch-products.controller';
import { UpdateProductService } from './services/update-product.service';
import { DeleteProductService } from './services/delete-product.service';
import { GetProductService } from './services/get-product.service';
import { FetchProductsService } from './services/fetch-products.service';
import { UnitOfMeasurementModule } from '../unit-of-measurement/unit-of-measurement.module';

@Module({
  imports: [PrismaModule, UnitOfMeasurementModule],
  controllers: [
    CreateProductController,
    UpdateProductController,
    DeleteProductController,
    GetProductController,
    FetchProductsController,
  ],
  providers: [
    {
      provide: PRODUCT_REPOSITORY,
      useClass: PrismaProductRepository,
    },
    CreateProductService,
    UpdateProductService,
    DeleteProductService,
    GetProductService,
    FetchProductsService,
  ],
  exports: [PRODUCT_REPOSITORY],
})
export class ProductModule {}
