import { CurrencyConverter } from '../services/currency-converter.service.js';
import { AppliedRate } from '../value-objects/applied-rate.vo.js';
import { CurrencyPair } from '../value-objects/currency-pair.vo.js';
import { ExchangeAmount } from '../value-objects/exchange-amount.vo.js';
import { Transaction } from './transaction.entity.js';

describe('Transaction', () => {
  it('records the conversion with the rate that was applied', () => {
    const now = new Date('2026-11-18T15:00:00Z');
    const conversion = new CurrencyConverter().convert(
      ExchangeAmount.create(100),
      CurrencyPair.of('USD', 'PEN'),
      AppliedRate.create('rate-7', '3.728', '3.739'),
    );

    const recorded = Transaction.fromConversion('user-1', conversion, now);
    const transaction = Transaction.restore({ id: 'tx-1', ...recorded });

    expect(transaction.userId).toBe('user-1');
    expect(transaction.exchangeRateId).toBe('rate-7');
    expect(transaction.appliedRate.toString()).toBe('3.739');
    expect(transaction.amount.value.toString()).toBe('100');
    expect(transaction.convertedAmount.toFixed(2)).toBe('373.90');
    expect(transaction.createdAt).toBe(now);
  });
});
