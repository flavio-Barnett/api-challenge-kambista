import type { Provider } from '@nestjs/common';

import { Clock } from '../../shared/domain/clock.port.js';
import { useCase } from '../../shared/infrastructure/di/use-case.provider.js';
import { ExchangeRateCache } from './application/ports/exchange-rate-cache.port.js';
import { ExchangeRateProvider } from './application/ports/exchange-rate-provider.port.js';
import { GetCurrentExchangeRateUseCase } from './application/use-cases/get-current-exchange-rate.use-case.js';
import { RefreshExchangeRateUseCase } from './application/use-cases/refresh-exchange-rate.use-case.js';
import { ExchangeRateRepository } from './domain/repositories/exchange-rate.repository.js';
import { InMemoryExchangeRateCacheAdapter } from './infrastructure/cache/in-memory-exchange-rate-cache.adapter.js';
import { MongoExchangeRateRepository } from './infrastructure/persistence/mongo-exchange-rate.repository.js';
import { SunatExchangeRateProviderAdapter } from './infrastructure/provider/sunat-exchange-rate-provider.adapter.js';
import { ExchangeRatePoller } from './infrastructure/scheduling/exchange-rate.poller.js';

const adapters: Provider[] = [
  { provide: ExchangeRateRepository, useClass: MongoExchangeRateRepository },
  { provide: ExchangeRateProvider, useClass: SunatExchangeRateProviderAdapter },
  { provide: ExchangeRateCache, useClass: InMemoryExchangeRateCacheAdapter },
];

const useCases: Provider[] = [
  useCase(RefreshExchangeRateUseCase, [
    ExchangeRateProvider,
    ExchangeRateRepository,
    ExchangeRateCache,
    Clock,
  ]),
  useCase(GetCurrentExchangeRateUseCase, [
    ExchangeRateRepository,
    ExchangeRateCache,
  ]),
];

export const exchangeRatesProviders: Provider[] = [
  ...adapters,
  ...useCases,
  ExchangeRatePoller,
];
