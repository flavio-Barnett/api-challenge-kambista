import { GetCurrentExchangeRateUseCase } from '../../../exchange-rates/application/use-cases/get-current-exchange-rate.use-case.js';
import { ExchangeRate } from '../../../exchange-rates/domain/entities/exchange-rate.entity.js';
import { ExchangeRateNotAvailableError } from '../../../exchange-rates/domain/exchange-rates.errors.js';
import { ExchangeRateQuote } from '../../../exchange-rates/domain/value-objects/exchange-rate-quote.vo.js';
import { InMemoryExchangeRateCacheAdapter } from '../../../exchange-rates/infrastructure/cache/in-memory-exchange-rate-cache.adapter.js';
import { InMemoryExchangeRateRepository } from '../../../exchange-rates/testing/in-memory-exchange-rate.repository.js';
import { ExchangeRatesRateReaderAdapter } from './exchange-rates-rate-reader.adapter.js';

describe('ExchangeRatesRateReaderAdapter', () => {
  let rates: InMemoryExchangeRateRepository;
  let reader: ExchangeRatesRateReaderAdapter;

  beforeEach(() => {
    rates = new InMemoryExchangeRateRepository();
    reader = new ExchangeRatesRateReaderAdapter(
      new GetCurrentExchangeRateUseCase(
        rates,
        new InMemoryExchangeRateCacheAdapter(),
      ),
    );
  });

  it('reads the current rate with its id', async () => {
    const stored = await rates.save(
      ExchangeRate.publish(
        ExchangeRateQuote.create('3.728', '3.739', '2026-11-18'),
        new Date('2026-11-18T12:00:00Z'),
      ),
    );

    const rate = await reader.read();

    expect(rate.exchangeRateId).toBe(stored.id);
    expect(rate.buy.toString()).toBe('3.728');
    expect(rate.sell.toString()).toBe('3.739');
  });

  it('lets the unavailable rate error through', async () => {
    await expect(reader.read()).rejects.toBeInstanceOf(
      ExchangeRateNotAvailableError,
    );
  });
});
