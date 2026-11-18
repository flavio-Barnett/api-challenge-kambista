import type {
  TransactionHistoryPage,
  TransactionRepository,
} from '../../domain/repositories/transaction.repository.js';
import { DateRange } from '../../domain/value-objects/date-range.vo.js';
import type { UserLookup } from '../ports/user-lookup.port.js';
import { UserNotFoundError } from '../transactions.errors.js';

export interface HistoryRequester {
  readonly id: string;
  readonly isAdmin: boolean;
}

export interface GetTransactionHistoryInput {
  readonly requester: HistoryRequester;
  readonly startDate: string;
  readonly endDate: string;
  readonly userId?: string;
  readonly page: number;
  readonly limit: number;
}

export class GetTransactionHistoryUseCase {
  constructor(
    private readonly transactions: TransactionRepository,
    private readonly users: UserLookup,
  ) {}

  async execute(
    input: GetTransactionHistoryInput,
  ): Promise<TransactionHistoryPage> {
    const range = DateRange.fromLimaDates(input.startDate, input.endDate);
    const userId = await this.resolveOwner(input);
    return this.transactions.findByUser({
      userId,
      range,
      page: input.page,
      limit: input.limit,
    });
  }

  private async resolveOwner(
    input: GetTransactionHistoryInput,
  ): Promise<string> {
    const { requester, userId } = input;
    if (!requester.isAdmin || !userId || userId === requester.id) {
      return requester.id;
    }
    if (!(await this.users.exists(userId))) {
      throw new UserNotFoundError();
    }
    return userId;
  }
}
