import { Types } from 'mongoose';

import { ExchangeRate } from '../../domain/entities/exchange-rate.entity.js';
import { ExchangeRateQuote } from '../../domain/value-objects/exchange-rate-quote.vo.js';
import {
  CorruptedExchangeRateRecordError,
  toExchangeRate,
  toExchangeRateDocument,
} from './exchange-rate.mapper.js';

describe('exchange rate mapper', () => {
  it('keeps the exact rates through a round trip with Decimal128', () => {
    const now = new Date('2026-11-17T12:00:00Z');
    const document = toExchangeRateDocument(
      ExchangeRate.publish(
        ExchangeRateQuote.create('3.408', '3.419', '2026-11-17'),
        now,
      ),
    );
    const id = new Types.ObjectId();

    const rate = toExchangeRate({ _id: id, ...document });

    expect(document.buy).toBeInstanceOf(Types.Decimal128);
    expect(rate.id).toBe(id.toHexString());
    expect(rate.quote.buy.toString()).toBe('3.408');
    expect(rate.quote.sell.toString()).toBe('3.419');
    expect(rate.validFrom).toEqual(now);
  });

  it('reports a corrupted stored rate as an internal error', () => {
    const id = new Types.ObjectId();
    const now = new Date();

    expect(() =>
      toExchangeRate({
        _id: id,
        buy: Types.Decimal128.fromString('3.5'),
        sell: Types.Decimal128.fromString('3.419'),
        providerDate: '2026-11-17',
        validFrom: now,
        lastCheckedAt: now,
      }),
    ).toThrow(CorruptedExchangeRateRecordError);
  });
});
