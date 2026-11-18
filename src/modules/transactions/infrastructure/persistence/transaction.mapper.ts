import { Decimal } from 'decimal.js';
import { Types } from 'mongoose';

import {
  type NewTransaction,
  Transaction,
} from '../../domain/entities/transaction.entity.js';
import { ExchangeAmount } from '../../domain/value-objects/exchange-amount.vo.js';
import type { TransactionRecord } from './transaction.schema.js';

export class CorruptedTransactionRecordError extends Error {
  constructor(id: string) {
    super(`Stored transaction ${id} has an invalid amount`);
  }
}

function toExchangeAmount(record: TransactionRecord): ExchangeAmount {
  try {
    return ExchangeAmount.create(record.amount.toString());
  } catch {
    throw new CorruptedTransactionRecordError(record._id.toHexString());
  }
}

function toDecimal128(value: Decimal): Types.Decimal128 {
  return Types.Decimal128.fromString(value.toString());
}

export function toTransaction(record: TransactionRecord): Transaction {
  return Transaction.restore({
    id: record._id.toHexString(),
    userId: record.userId.toHexString(),
    from: record.from,
    to: record.to,
    amount: toExchangeAmount(record),
    convertedAmount: new Decimal(record.convertedAmount.toString()),
    appliedRate: new Decimal(record.appliedRate.toString()),
    exchangeRateId: record.exchangeRateId,
    createdAt: record.createdAt,
  });
}

export function toTransactionDocument(
  transaction: NewTransaction,
): Omit<TransactionRecord, '_id'> {
  return {
    userId: new Types.ObjectId(transaction.userId),
    from: transaction.from,
    to: transaction.to,
    amount: toDecimal128(transaction.amount.value),
    convertedAmount: toDecimal128(transaction.convertedAmount),
    appliedRate: toDecimal128(transaction.appliedRate),
    exchangeRateId: transaction.exchangeRateId,
    createdAt: transaction.createdAt,
  };
}
