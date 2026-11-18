import { ExchangeRateQuote } from '../value-objects/exchange-rate-quote.vo.js';
import { ExchangeRate } from './exchange-rate.entity.js';

const quote = ExchangeRateQuote.create('3.408', '3.419', '2026-11-17');
const publishedAt = new Date('2026-11-17T12:00:00Z');

describe('ExchangeRate', () => {
  it('publishes a quote valid from now', () => {
    expect(ExchangeRate.publish(quote, publishedAt)).toEqual({
      quote,
      validFrom: publishedAt,
      lastCheckedAt: publishedAt,
    });
  });

  it('confirms an unchanged rate with the latest provider date', () => {
    const rate = ExchangeRate.restore({
      id: '1',
      ...ExchangeRate.publish(quote, publishedAt),
    });
    const nextDay = new Date('2026-11-18T12:00:00Z');
    const sameRatesNextDay = ExchangeRateQuote.create(
      '3.408',
      '3.419',
      '2026-11-18',
    );

    const confirmed = rate.confirm(sameRatesNextDay, nextDay);

    expect(confirmed.lastCheckedAt).toEqual(nextDay);
    expect(confirmed.quote.providerDate).toBe('2026-11-18');
    expect(confirmed.validFrom).toEqual(publishedAt);
    expect(rate.lastCheckedAt).toEqual(publishedAt);
  });

  it('compares versions by the moment they became valid', () => {
    const older = ExchangeRate.restore({
      id: '1',
      ...ExchangeRate.publish(quote, publishedAt),
    });
    const newer = ExchangeRate.restore({
      id: '2',
      ...ExchangeRate.publish(quote, new Date('2026-11-17T12:00:30Z')),
    });

    expect(newer.isNewerThan(older)).toBe(true);
    expect(older.isNewerThan(newer)).toBe(false);
  });
});
