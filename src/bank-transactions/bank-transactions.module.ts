import { Module } from '@nestjs/common';
import { MongoEntities } from '../database/database.utils';
import { WorkspaceBillingsModule } from '../workspace-billings/workspace-billings.module';
import { BankTransactionsController } from './bank-transactions.controller';
import { BankTransactionEntity } from './bank-transactions.entity';
import { BankTransactionsService } from './bank-transactions.service';

@Module({
  controllers: [BankTransactionsController],
  providers: [BankTransactionsService],
  imports: [
    MongoEntities(BankTransactionEntity),
    WorkspaceBillingsModule,
  ],
  exports: [BankTransactionsService],
})
export class BankTransactionsModule {}
