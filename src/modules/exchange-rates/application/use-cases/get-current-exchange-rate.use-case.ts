import type { ExchangeRate } from '../../domain/entities/exchange-rate.entity.js';
import { ExchangeRateNotAvailableError } from '../../domain/exchange-rates.errors.js';
import type { ExchangeRateRepository } from '../../domain/repositories/exchange-rate.repository.js';
import type { ExchangeRateCache } from '../ports/exchange-rate-cache.port.js';

export class GetCurrentExchangeRateUseCase {
  constructor(
    private readonly rates: ExchangeRateRepository,
    private readonly cache: ExchangeRateCache,
  ) {}

  async execute(): Promise<ExchangeRate> {
    const cached = this.cache.get();
    if (cached) {
      return cached;
    }
    const stored = await this.rates.findCurrent();
    if (!stored) {
      throw new ExchangeRateNotAvailableError();
    }
    this.cache.keepLatest(stored);
    return stored;
  }
}
