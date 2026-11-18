import { InvalidAmountError } from '../transactions.errors.js';
import { ExchangeAmount } from './exchange-amount.vo.js';

describe('ExchangeAmount', () => {
  it.each([100, 1e2, '0.01', 1.5, '9999999.99'])('accepts %j', (value) => {
    expect(ExchangeAmount.create(value).value.toString()).toBe(String(value));
  });

  it.each([
    ['zero', 0],
    ['a negative amount', -10],
    ['three decimals', 1.234],
    ['eight integer digits', 10_000_000],
    ['a value above the maximum', '9999999.991'],
    ['not a number', 'abc'],
    ['infinity', Infinity],
    ['NaN', NaN],
    ['a tiny exponential number', 1e-7],
    ['a huge exponential number', 1e20],
    ['a floating point artifact', 0.1 + 0.2],
  ])('rejects %s', (_case, value) => {
    expect(() => ExchangeAmount.create(value)).toThrow(InvalidAmountError);
  });

  it('reports the INVALID_AMOUNT code', () => {
    expect(() => ExchangeAmount.create(0)).toThrow(
      expect.objectContaining({ code: 'INVALID_AMOUNT', kind: 'validation' }),
    );
  });
});
