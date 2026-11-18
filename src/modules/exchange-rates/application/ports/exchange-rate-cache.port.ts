import type { ExchangeRate } from '../../domain/entities/exchange-rate.entity.js';

export abstract class ExchangeRateCache {
  abstract get(): ExchangeRate | null;
  abstract keepLatest(rate: ExchangeRate): void;
}
