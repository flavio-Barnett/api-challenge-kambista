import type { Clock } from '../../../../shared/domain/clock.port.js';
import { ExchangeRate } from '../../domain/entities/exchange-rate.entity.js';
import type { ExchangeRateRepository } from '../../domain/repositories/exchange-rate.repository.js';
import type { ExchangeRateQuote } from '../../domain/value-objects/exchange-rate-quote.vo.js';
import type { ExchangeRateCache } from '../ports/exchange-rate-cache.port.js';
import type { ExchangeRateProvider } from '../ports/exchange-rate-provider.port.js';

export class RefreshExchangeRateUseCase {
  constructor(
    private readonly provider: ExchangeRateProvider,
    private readonly rates: ExchangeRateRepository,
    private readonly cache: ExchangeRateCache,
    private readonly clock: Clock,
  ) {}

  async execute(): Promise<ExchangeRate> {
    const quote = await this.provider.fetchQuote();
    const now = this.clock.now();
    const current = await this.rates.findCurrent();
    const refreshed = current?.matches(quote)
      ? await this.confirm(current, quote, now)
      : await this.rates.save(ExchangeRate.publish(quote, now));
    this.cache.keepLatest(refreshed);
    return refreshed;
  }

  private async confirm(
    current: ExchangeRate,
    quote: ExchangeRateQuote,
    now: Date,
  ): Promise<ExchangeRate> {
    await this.rates.confirm(current.id, quote.providerDate, now);
    return current.confirm(quote, now);
  }
}
