import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { type Model, Types } from 'mongoose';

import type {
  NewTransaction,
  Transaction,
} from '../../domain/entities/transaction.entity.js';
import {
  type TransactionHistoryPage,
  type TransactionHistoryQuery,
  TransactionRepository,
} from '../../domain/repositories/transaction.repository.js';
import { toTransaction, toTransactionDocument } from './transaction.mapper.js';
import {
  TRANSACTION_MODEL,
  type TransactionRecord,
} from './transaction.schema.js';

@Injectable()
export class MongoTransactionRepository extends TransactionRepository {
  constructor(
    @InjectModel(TRANSACTION_MODEL)
    private readonly transactions: Model<TransactionRecord>,
  ) {
    super();
  }

  async save(transaction: NewTransaction): Promise<Transaction> {
    const created = await this.transactions.create(
      toTransactionDocument(transaction),
    );
    return toTransaction(created.toObject());
  }

  async findByUser(
    query: TransactionHistoryQuery,
  ): Promise<TransactionHistoryPage> {
    const filter = {
      userId: new Types.ObjectId(query.userId),
      createdAt: { $gte: query.range.start, $lt: query.range.end },
    };
    const [records, total] = await Promise.all([
      this.transactions
        .find(filter)
        .sort({ createdAt: -1, _id: -1 })
        .skip((query.page - 1) * query.limit)
        .limit(query.limit)
        .lean<TransactionRecord[]>()
        .exec(),
      this.transactions.countDocuments(filter).exec(),
    ]);
    return { items: records.map(toTransaction), total };
  }
}
