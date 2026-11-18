import type { Provider } from '@nestjs/common';

import { Clock } from '../../shared/domain/clock.port.js';
import { useCase } from '../../shared/infrastructure/di/use-case.provider.js';
import { CurrentRateReader } from './application/ports/current-rate-reader.port.js';
import { UserLookup } from './application/ports/user-lookup.port.js';
import { CreateTransactionUseCase } from './application/use-cases/create-transaction.use-case.js';
import { GetTransactionHistoryUseCase } from './application/use-cases/get-transaction-history.use-case.js';
import { TransactionRepository } from './domain/repositories/transaction.repository.js';
import { AuthUserLookupAdapter } from './infrastructure/integrations/auth-user-lookup.adapter.js';
import { ExchangeRatesRateReaderAdapter } from './infrastructure/integrations/exchange-rates-rate-reader.adapter.js';
import { MongoTransactionRepository } from './infrastructure/persistence/mongo-transaction.repository.js';

const adapters: Provider[] = [
  { provide: TransactionRepository, useClass: MongoTransactionRepository },
  { provide: CurrentRateReader, useClass: ExchangeRatesRateReaderAdapter },
  { provide: UserLookup, useClass: AuthUserLookupAdapter },
];

const useCases: Provider[] = [
  useCase(CreateTransactionUseCase, [
    CurrentRateReader,
    TransactionRepository,
    Clock,
  ]),
  useCase(GetTransactionHistoryUseCase, [TransactionRepository, UserLookup]),
];

export const transactionsProviders: Provider[] = [...adapters, ...useCases];
