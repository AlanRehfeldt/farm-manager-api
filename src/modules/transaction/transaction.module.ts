import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/common/prisma/prisma.module';
import { PrismaTransactionRepository } from './repositories/prisma-transaction.repository';
import { TRANSACTION_REPOSITORY } from './repositories/transaction.repository';
import { CreateTransactionController } from './controllers/create-transaction.controller';
import { CreateTransactionService } from './services/create-transaction.service';
import { UpdateTransactionController } from './controllers/update-transaction.controller';
import { DeleteTransactionController } from './controllers/delete-transaction.controller';
import { GetTransactionController } from './controllers/get-transaction.controller';
import { FetchTransactionsController } from './controllers/fetch-transactions.controller';
import { UpdateTransactionService } from './services/update-transaction.service';
import { DeleteTransactionService } from './services/delete-transaction.service';
import { GetTransactionService } from './services/get-transaction.service';
import { FetchTransactionsService } from './services/fetch-transactions.service';

@Module({
  imports: [PrismaModule],
  controllers: [
    CreateTransactionController,
    UpdateTransactionController,
    DeleteTransactionController,
    GetTransactionController,
    FetchTransactionsController,
  ],
  providers: [
    {
      provide: TRANSACTION_REPOSITORY,
      useClass: PrismaTransactionRepository,
    },
    CreateTransactionService,
    UpdateTransactionService,
    DeleteTransactionService,
    GetTransactionService,
    FetchTransactionsService,
  ],
  exports: [TRANSACTION_REPOSITORY],
})
export class TransactionModule {}
