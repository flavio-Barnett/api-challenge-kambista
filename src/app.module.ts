import { Module } from '@nestjs/common';

import { AuthModule } from './modules/auth/auth.module.js';
import { ExchangeRatesModule } from './modules/exchange-rates/exchange-rates.module.js';
import { TransactionsModule } from './modules/transactions/transactions.module.js';
import { AppConfigModule } from './shared/infrastructure/config/app-config.module.js';
import { DatabaseModule } from './shared/infrastructure/database/database.module.js';
import { HealthModule } from './shared/infrastructure/health/health.module.js';
import { httpProviders } from './shared/infrastructure/http/http.providers.js';
import { LoggingModule } from './shared/infrastructure/logging/logging.module.js';
import { TimeModule } from './shared/infrastructure/time/time.module.js';

@Module({
  imports: [
    AppConfigModule,
    TimeModule,
    LoggingModule,
    DatabaseModule,
    HealthModule,
    AuthModule,
    ExchangeRatesModule,
    TransactionsModule,
  ],
  providers: [...httpProviders],
})
export class AppModule {}
