import { Schema, type Types } from 'mongoose';

export const EXCHANGE_RATE_MODEL = 'ExchangeRate';

export interface ExchangeRateRecord {
  readonly _id: Types.ObjectId;
  readonly buy: Types.Decimal128;
  readonly sell: Types.Decimal128;
  readonly providerDate: string;
  readonly validFrom: Date;
  readonly lastCheckedAt: Date;
}

export const exchangeRateSchema = new Schema<ExchangeRateRecord>(
  {
    buy: { type: Schema.Types.Decimal128, required: true },
    sell: { type: Schema.Types.Decimal128, required: true },
    providerDate: { type: String, required: true },
    validFrom: { type: Date, required: true, index: -1 },
    lastCheckedAt: { type: Date, required: true },
  },
  { collection: 'exchange_rates', versionKey: false },
);
