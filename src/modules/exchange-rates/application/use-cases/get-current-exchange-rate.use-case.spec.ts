import { ExchangeRate } from '../../domain/entities/exchange-rate.entity.js';
import { ExchangeRateNotAvailableError } from '../../domain/exchange-rates.errors.js';
import { ExchangeRateQuote } from '../../domain/value-objects/exchange-rate-quote.vo.js';
import { InMemoryExchangeRateCacheAdapter } from '../../infrastructure/cache/in-memory-exchange-rate-cache.adapter.js';
import { InMemoryExchangeRateRepository } from '../../testing/in-memory-exchange-rate.repository.js';
import { GetCurrentExchangeRateUseCase } from './get-current-exchange-rate.use-case.js';

const quote = ExchangeRateQuote.create('3.408', '3.419', '2026-11-17');
const publishedAt = new Date('2026-11-17T12:00:00Z');

describe('GetCurrentExchangeRateUseCase', () => {
  let rates: InMemoryExchangeRateRepository;
  let cache: InMemoryExchangeRateCacheAdapter;
  let getCurrent: GetCurrentExchangeRateUseCase;

  beforeEach(() => {
    rates = new InMemoryExchangeRateRepository();
    cache = new InMemoryExchangeRateCacheAdapter();
    getCurrent = new GetCurrentExchangeRateUseCase(rates, cache);
  });

  it('answers from the cache without reading the repository', async () => {
    const cached = ExchangeRate.restore({
      id: 'cached',
      ...ExchangeRate.publish(quote, publishedAt),
    });
    cache.keepLatest(cached);
    const findCurrent = vi.spyOn(rates, 'findCurrent');

    await expect(getCurrent.execute()).resolves.toBe(cached);
    expect(findCurrent).not.toHaveBeenCalled();
  });

  it('falls back to the stored rate and caches it', async () => {
    const stored = await rates.save(ExchangeRate.publish(quote, publishedAt));

    await expect(getCurrent.execute()).resolves.toBe(stored);
    expect(cache.get()).toBe(stored);
  });

  it('fails when no rate has ever been stored', async () => {
    await expect(getCurrent.execute()).rejects.toBeInstanceOf(
      ExchangeRateNotAvailableError,
    );
  });

  it('never replaces a newer cached rate with an older stored one', async () => {
    const older = await rates.save(ExchangeRate.publish(quote, publishedAt));
    const newer = ExchangeRate.restore({
      id: 'newer',
      ...ExchangeRate.publish(quote, new Date('2026-11-17T12:00:30Z')),
    });
    let releaseRead: (rate: ExchangeRate) => void = () => undefined;
    vi.spyOn(rates, 'findCurrent').mockReturnValue(
      new Promise((resolve) => {
        releaseRead = resolve;
      }),
    );

    const reading = getCurrent.execute();
    cache.keepLatest(newer);
    releaseRead(older);
    await reading;

    expect(cache.get()).toBe(newer);
  });
});
