import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/common/prisma/prisma.module';
import { FetchStockBalancesController } from './controllers/fetch-stock-balances.controller';
import { PrismaStockBalanceRepository } from './repositories/prisma-stock-balance.repository';
import { STOCK_BALANCE_REPOSITORY } from './repositories/stock-balance.repository';
import { FetchStockBalancesService } from './services/fetch-stock-balances.service';

@Module({
  imports: [PrismaModule],
  controllers: [FetchStockBalancesController],
  providers: [
    {
      provide: STOCK_BALANCE_REPOSITORY,
      useClass: PrismaStockBalanceRepository,
    },
    FetchStockBalancesService,
  ],
})
export class InventoryModule {}
