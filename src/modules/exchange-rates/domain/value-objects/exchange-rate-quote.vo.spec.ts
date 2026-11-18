import { InvalidExchangeRateError } from '../exchange-rates.errors.js';
import { ExchangeRateQuote } from './exchange-rate-quote.vo.js';

describe('ExchangeRateQuote', () => {
  it('keeps the rates as exact decimals', () => {
    const quote = ExchangeRateQuote.create(3.408, '3.419', '2026-11-17');

    expect(quote.buy.toString()).toBe('3.408');
    expect(quote.sell.plus('0.001').toString()).toBe('3.42');
  });

  it.each([
    ['a zero buy rate', 0, 3.419, '2026-11-17'],
    ['a negative sell rate', 3.408, -1, '2026-11-17'],
    ['a buy rate above the sell rate', 3.5, 3.419, '2026-11-17'],
    ['a malformed provider date', 3.408, 3.419, '17/11/2026'],
    ['an impossible provider date', 3.408, 3.419, '2026-13-45'],
  ])('rejects %s', (_case, buy, sell, providerDate) => {
    expect(() => ExchangeRateQuote.create(buy, sell, providerDate)).toThrow(
      InvalidExchangeRateError,
    );
  });

  it('compares quotes by their buy and sell rates', () => {
    const quote = ExchangeRateQuote.create('3.408', '3.419', '2026-11-17');

    expect(
      quote.hasSameRatesAs(
        ExchangeRateQuote.create('3.4080', '3.419', '2026-11-18'),
      ),
    ).toBe(true);
    expect(
      quote.hasSameRatesAs(
        ExchangeRateQuote.create('3.409', '3.419', '2026-11-17'),
      ),
    ).toBe(false);
  });
});
