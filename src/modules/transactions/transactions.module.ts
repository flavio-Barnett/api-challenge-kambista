import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AuthModule } from '../auth/auth.module.js';
import { ExchangeRatesModule } from '../exchange-rates/exchange-rates.module.js';
import { TransactionsController } from './infrastructure/http/transactions.controller.js';
import {
  TRANSACTION_MODEL,
  transactionSchema,
} from './infrastructure/persistence/transaction.schema.js';
import { transactionsProviders } from './transactions.providers.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TRANSACTION_MODEL, schema: transactionSchema },
    ]),
    AuthModule,
    ExchangeRatesModule,
  ],
  controllers: [TransactionsController],
  providers: transactionsProviders,
})
export class TransactionsModule {}
