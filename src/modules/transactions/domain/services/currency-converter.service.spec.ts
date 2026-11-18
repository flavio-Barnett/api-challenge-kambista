import { SameCurrencyError } from '../transactions.errors.js';
import { AppliedRate } from '../value-objects/applied-rate.vo.js';
import { CurrencyPair } from '../value-objects/currency-pair.vo.js';
import { ExchangeAmount } from '../value-objects/exchange-amount.vo.js';
import { CurrencyConverter } from './currency-converter.service.js';

const converter = new CurrencyConverter();
const rate = AppliedRate.create('rate-1', '3.728', '3.739');
const usdToPen = CurrencyPair.of('USD', 'PEN');
const penToUsd = CurrencyPair.of('PEN', 'USD');

describe('CurrencyConverter', () => {
  it('sells dollars at the sell rate', () => {
    const conversion = converter.convert(
      ExchangeAmount.create(100),
      usdToPen,
      rate,
    );

    expect(conversion.convertedAmount.toFixed(2)).toBe('373.90');
    expect(conversion.convertedAmount.toNumber()).toBe(373.9);
    expect(conversion.appliedRate.toNumber()).toBe(3.739);
    expect(conversion.exchangeRateId).toBe('rate-1');
  });

  it('buys dollars dividing by the buy rate, rounded to cents', () => {
    const conversion = converter.convert(
      ExchangeAmount.create(100),
      penToUsd,
      rate,
    );

    expect(conversion.convertedAmount.toString()).toBe('26.82');
    expect(conversion.appliedRate.toNumber()).toBe(3.728);
    expect(conversion.from).toBe('PEN');
    expect(conversion.to).toBe('USD');
  });

  it.each([
    ['a product ending in 5', usdToPen, '0.15', '3.5', '3.5', '0.53'],
    ['a quotient ending in 5', penToUsd, '1', '8', '8', '0.13'],
    ['a value just below half', usdToPen, '0.01', '3.4', '3.449', '0.03'],
  ])('rounds half up on %s', (_case, pair, amount, buy, sell, expected) => {
    const conversion = converter.convert(
      ExchangeAmount.create(amount),
      pair,
      AppliedRate.create('rate-1', buy, sell),
    );

    expect(conversion.convertedAmount.toFixed(2)).toBe(expected);
  });

  it('handles the maximum amount without losing precision', () => {
    const conversion = converter.convert(
      ExchangeAmount.create('9999999.99'),
      usdToPen,
      rate,
    );

    expect(conversion.convertedAmount.toString()).toBe('37389999.96');
  });

  it.each(['USD', 'PEN'] as const)(
    'refuses to exchange %s for itself',
    (currency) => {
      expect(() => CurrencyPair.of(currency, currency)).toThrow(
        SameCurrencyError,
      );
      expect(() => CurrencyPair.of(currency, currency)).toThrow(
        expect.objectContaining({ code: 'SAME_CURRENCY', kind: 'validation' }),
      );
    },
  );
});
