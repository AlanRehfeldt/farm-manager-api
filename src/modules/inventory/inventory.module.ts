import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/common/prisma/prisma.module';
import { ProductModule } from 'src/modules/product/product.module';
import { CreateStockAdjustmentController } from './controllers/create-stock-adjustment.controller';
import { FetchStockBalancesController } from './controllers/fetch-stock-balances.controller';
import { PrismaStockBalanceRepository } from './repositories/prisma-stock-balance.repository';
import { PrismaStockMovementRepository } from './repositories/prisma-stock-movement.repository';
import { STOCK_BALANCE_REPOSITORY } from './repositories/stock-balance.repository';
import { STOCK_MOVEMENT_REPOSITORY } from './repositories/stock-movement.repository';
import { CreateStockAdjustmentService } from './services/create-stock-adjustment.service';
import { FetchStockBalancesService } from './services/fetch-stock-balances.service';

@Module({
  imports: [PrismaModule, ProductModule],
  controllers: [FetchStockBalancesController, CreateStockAdjustmentController],
  providers: [
    {
      provide: STOCK_BALANCE_REPOSITORY,
      useClass: PrismaStockBalanceRepository,
    },
    {
      provide: STOCK_MOVEMENT_REPOSITORY,
      useClass: PrismaStockMovementRepository,
    },
    FetchStockBalancesService,
    CreateStockAdjustmentService,
  ],
})
export class InventoryModule {}
