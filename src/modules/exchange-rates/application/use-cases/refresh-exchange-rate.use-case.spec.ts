import { FixedClock } from '../../../../shared/testing/fixed-clock.js';
import { InMemoryExchangeRateCacheAdapter } from '../../infrastructure/cache/in-memory-exchange-rate-cache.adapter.js';
import { FakeExchangeRateProvider } from '../../testing/fake-exchange-rate-provider.js';
import { InMemoryExchangeRateRepository } from '../../testing/in-memory-exchange-rate.repository.js';
import { ExchangeRateProviderError } from '../exchange-rates.errors.js';
import { RefreshExchangeRateUseCase } from './refresh-exchange-rate.use-case.js';

const THIRTY_SECONDS = 30 * 1000;

describe('RefreshExchangeRateUseCase', () => {
  let provider: FakeExchangeRateProvider;
  let rates: InMemoryExchangeRateRepository;
  let cache: InMemoryExchangeRateCacheAdapter;
  let clock: FixedClock;
  let refresh: RefreshExchangeRateUseCase;

  beforeEach(() => {
    provider = new FakeExchangeRateProvider();
    rates = new InMemoryExchangeRateRepository();
    cache = new InMemoryExchangeRateCacheAdapter();
    clock = new FixedClock(new Date('2026-11-17T12:00:00Z'));
    refresh = new RefreshExchangeRateUseCase(provider, rates, cache, clock);
  });

  it('stores the first rate it receives and caches it', async () => {
    const rate = await refresh.execute();

    expect(rates.versions).toBe(1);
    expect(rate.quote.sell.toString()).toBe('3.419');
    expect(cache.get()).toBe(rate);
  });

  it('only records the check when the rates did not change', async () => {
    const first = await refresh.execute();
    clock.advanceBy(THIRTY_SECONDS);

    const second = await refresh.execute();

    expect(rates.versions).toBe(1);
    expect(second.validFrom).toEqual(first.validFrom);
    expect(second.lastCheckedAt).toEqual(clock.now());
    expect((await rates.findCurrent())?.lastCheckedAt).toEqual(clock.now());
  });

  it('stores a new version valid from now when the rates change', async () => {
    await refresh.execute();
    clock.advanceBy(THIRTY_SECONDS);
    provider.willQuote('3.410', '3.421');

    const updated = await refresh.execute();

    expect(rates.versions).toBe(2);
    expect(updated.validFrom).toEqual(clock.now());
    expect(cache.get()).toBe(updated);
  });

  it('keeps the last rate when the provider fails', async () => {
    const stored = await refresh.execute();
    provider.willFail(new ExchangeRateProviderError('timeout'));

    await expect(refresh.execute()).rejects.toBeInstanceOf(
      ExchangeRateProviderError,
    );
    expect(rates.versions).toBe(1);
    expect(cache.get()).toBe(stored);
  });

  it('records the new provider date when the same rates are republished', async () => {
    await refresh.execute();
    clock.advanceBy(THIRTY_SECONDS);
    provider.willQuote('3.408', '3.419', '2026-11-18');

    const confirmed = await refresh.execute();

    expect(rates.versions).toBe(1);
    expect(confirmed.quote.providerDate).toBe('2026-11-18');
    expect((await rates.findCurrent())?.quote.providerDate).toBe('2026-11-18');
  });

  it('compares against the stored rate even when the cache is stale', async () => {
    const stale = await refresh.execute();
    clock.advanceBy(THIRTY_SECONDS);
    provider.willQuote('3.410', '3.421');
    await refresh.execute();
    cache.keepLatest(stale);
    clock.advanceBy(THIRTY_SECONDS);

    await refresh.execute();

    expect(rates.versions).toBe(2);
  });
});
