import type {
  NewTransaction,
  Transaction,
} from '../entities/transaction.entity.js';
import type { DateRange } from '../value-objects/date-range.vo.js';

export interface TransactionHistoryQuery {
  readonly userId: string;
  readonly range: DateRange;
  readonly page: number;
  readonly limit: number;
}

export interface TransactionHistoryPage {
  readonly items: readonly Transaction[];
  readonly total: number;
}

export abstract class TransactionRepository {
  abstract save(transaction: NewTransaction): Promise<Transaction>;
  abstract findByUser(
    query: TransactionHistoryQuery,
  ): Promise<TransactionHistoryPage>;
}
