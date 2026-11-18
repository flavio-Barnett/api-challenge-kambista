import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { GetCurrentExchangeRateUseCase } from './application/use-cases/get-current-exchange-rate.use-case.js';
import { exchangeRatesProviders } from './exchange-rates.providers.js';
import {
  EXCHANGE_RATE_MODEL,
  exchangeRateSchema,
} from './infrastructure/persistence/exchange-rate.schema.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: EXCHANGE_RATE_MODEL, schema: exchangeRateSchema },
    ]),
  ],
  providers: exchangeRatesProviders,
  exports: [GetCurrentExchangeRateUseCase],
})
export class ExchangeRatesModule {}
