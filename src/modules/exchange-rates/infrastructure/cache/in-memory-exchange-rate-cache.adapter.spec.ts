import { ExchangeRate } from '../../domain/entities/exchange-rate.entity.js';
import { ExchangeRateQuote } from '../../domain/value-objects/exchange-rate-quote.vo.js';
import { InMemoryExchangeRateCacheAdapter } from './in-memory-exchange-rate-cache.adapter.js';

function rateValidFrom(id: string, validFrom: string): ExchangeRate {
  return ExchangeRate.restore({
    id,
    ...ExchangeRate.publish(
      ExchangeRateQuote.create('3.408', '3.419', '2026-11-17'),
      new Date(validFrom),
    ),
  });
}

describe('InMemoryExchangeRateCacheAdapter', () => {
  it('starts empty', () => {
    expect(new InMemoryExchangeRateCacheAdapter().get()).toBeNull();
  });

  it('keeps the newest rate and ignores older ones', () => {
    const cache = new InMemoryExchangeRateCacheAdapter();
    const older = rateValidFrom('older', '2026-11-17T12:00:00Z');
    const newer = rateValidFrom('newer', '2026-11-17T12:00:30Z');

    cache.keepLatest(newer);
    cache.keepLatest(older);

    expect(cache.get()).toBe(newer);
  });

  it('accepts a confirmation of the current version', () => {
    const cache = new InMemoryExchangeRateCacheAdapter();
    const current = rateValidFrom('current', '2026-11-17T12:00:00Z');
    const confirmed = current.confirm(current.quote, new Date());

    cache.keepLatest(current);
    cache.keepLatest(confirmed);

    expect(cache.get()).toBe(confirmed);
  });
});
