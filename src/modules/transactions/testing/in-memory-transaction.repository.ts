import {
  type NewTransaction,
  Transaction,
} from '../domain/entities/transaction.entity.js';
import {
  type TransactionHistoryPage,
  type TransactionHistoryQuery,
  TransactionRepository,
} from '../domain/repositories/transaction.repository.js';

export class InMemoryTransactionRepository extends TransactionRepository {
  private transactions: Transaction[] = [];

  get count(): number {
    return this.transactions.length;
  }

  save(transaction: NewTransaction): Promise<Transaction> {
    const saved = Transaction.restore({
      id: String(this.transactions.length + 1),
      ...transaction,
    });
    this.transactions.push(saved);
    return Promise.resolve(saved);
  }

  findByUser(query: TransactionHistoryQuery): Promise<TransactionHistoryPage> {
    const matching = this.transactions
      .filter(
        (transaction) =>
          transaction.userId === query.userId &&
          query.range.contains(transaction.createdAt),
      )
      .sort(
        (a, b) =>
          b.createdAt.getTime() - a.createdAt.getTime() ||
          Number(b.id) - Number(a.id),
      );
    const offset = (query.page - 1) * query.limit;
    return Promise.resolve({
      items: matching.slice(offset, offset + query.limit),
      total: matching.length,
    });
  }
}
