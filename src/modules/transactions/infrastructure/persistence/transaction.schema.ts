import { Schema, type Types } from 'mongoose';

import { CURRENCIES, type Currency } from '../../domain/types/currency.type.js';

export const TRANSACTION_MODEL = 'Transaction';

export interface TransactionRecord {
  readonly _id: Types.ObjectId;
  readonly userId: Types.ObjectId;
  readonly from: Currency;
  readonly to: Currency;
  readonly amount: Types.Decimal128;
  readonly convertedAmount: Types.Decimal128;
  readonly appliedRate: Types.Decimal128;
  readonly exchangeRateId: string;
  readonly createdAt: Date;
}

export const transactionSchema = new Schema<TransactionRecord>(
  {
    userId: { type: Schema.Types.ObjectId, required: true },
    from: { type: String, enum: CURRENCIES, required: true },
    to: { type: String, enum: CURRENCIES, required: true },
    amount: { type: Schema.Types.Decimal128, required: true },
    convertedAmount: { type: Schema.Types.Decimal128, required: true },
    appliedRate: { type: Schema.Types.Decimal128, required: true },
    exchangeRateId: { type: String, required: true },
    createdAt: { type: Date, required: true },
  },
  { collection: 'transactions', versionKey: false },
);

transactionSchema.index({ userId: 1, createdAt: -1, _id: -1 });
