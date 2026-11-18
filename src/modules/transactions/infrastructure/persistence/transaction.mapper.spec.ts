import { Decimal } from 'decimal.js';
import { Types } from 'mongoose';

import { Transaction } from '../../domain/entities/transaction.entity.js';
import { CurrencyConverter } from '../../domain/services/currency-converter.service.js';
import { AppliedRate } from '../../domain/value-objects/applied-rate.vo.js';
import { CurrencyPair } from '../../domain/value-objects/currency-pair.vo.js';
import { ExchangeAmount } from '../../domain/value-objects/exchange-amount.vo.js';
import {
  CorruptedTransactionRecordError,
  toTransaction,
  toTransactionDocument,
} from './transaction.mapper.js';

describe('transaction mapper', () => {
  it('keeps exact amounts and references through a round trip', () => {
    const userId = new Types.ObjectId().toHexString();
    const now = new Date('2026-11-18T15:00:00Z');
    const document = toTransactionDocument(
      Transaction.fromConversion(
        userId,
        new CurrencyConverter().convert(
          ExchangeAmount.create('100.5'),
          CurrencyPair.of('PEN', 'USD'),
          AppliedRate.create('rate-1', '3.728', '3.739'),
        ),
        now,
      ),
    );
    const id = new Types.ObjectId();

    const transaction = toTransaction({ _id: id, ...document });

    expect(document.amount).toBeInstanceOf(Types.Decimal128);
    expect(document.userId).toBeInstanceOf(Types.ObjectId);
    expect(transaction.id).toBe(id.toHexString());
    expect(transaction.userId).toBe(userId);
    expect(transaction.from).toBe('PEN');
    expect(transaction.to).toBe('USD');
    expect(transaction.amount.value.toString()).toBe('100.5');
    expect(transaction.convertedAmount.toString()).toBe('26.96');
    expect(transaction.appliedRate.toString()).toBe('3.728');
    expect(transaction.exchangeRateId).toBe('rate-1');
    expect(transaction.createdAt).toEqual(now);
  });

  it('reports a corrupted stored amount as an internal error', () => {
    expect(() =>
      toTransaction({
        _id: new Types.ObjectId(),
        userId: new Types.ObjectId(),
        from: 'USD',
        to: 'PEN',
        amount: Types.Decimal128.fromString('-1'),
        convertedAmount: Types.Decimal128.fromString(
          new Decimal('-3.74').toString(),
        ),
        appliedRate: Types.Decimal128.fromString('3.739'),
        exchangeRateId: 'rate-1',
        createdAt: new Date(),
      }),
    ).toThrow(CorruptedTransactionRecordError);
  });
});
