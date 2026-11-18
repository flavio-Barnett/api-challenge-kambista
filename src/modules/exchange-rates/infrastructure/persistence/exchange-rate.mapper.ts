import { Types } from 'mongoose';

import {
  ExchangeRate,
  type NewExchangeRate,
} from '../../domain/entities/exchange-rate.entity.js';
import { ExchangeRateQuote } from '../../domain/value-objects/exchange-rate-quote.vo.js';
import type { ExchangeRateRecord } from './exchange-rate.schema.js';

export class CorruptedExchangeRateRecordError extends Error {
  constructor(id: string) {
    super(`Stored exchange rate ${id} is not a valid quote`);
  }
}

function toQuote(record: ExchangeRateRecord): ExchangeRateQuote {
  try {
    return ExchangeRateQuote.create(
      record.buy.toString(),
      record.sell.toString(),
      record.providerDate,
    );
  } catch {
    throw new CorruptedExchangeRateRecordError(record._id.toHexString());
  }
}

export function toExchangeRate(record: ExchangeRateRecord): ExchangeRate {
  return ExchangeRate.restore({
    id: record._id.toHexString(),
    quote: toQuote(record),
    validFrom: record.validFrom,
    lastCheckedAt: record.lastCheckedAt,
  });
}

export function toExchangeRateDocument(
  rate: NewExchangeRate,
): Omit<ExchangeRateRecord, '_id'> {
  return {
    buy: Types.Decimal128.fromString(rate.quote.buy.toString()),
    sell: Types.Decimal128.fromString(rate.quote.sell.toString()),
    providerDate: rate.quote.providerDate,
    validFrom: rate.validFrom,
    lastCheckedAt: rate.lastCheckedAt,
  };
}
