import { Decimal } from 'decimal.js';

import { InvalidDateRangeError } from '../../domain/transactions.errors.js';
import { ExchangeAmount } from '../../domain/value-objects/exchange-amount.vo.js';
import { FakeUserLookup } from '../../testing/fake-user-lookup.js';
import { InMemoryTransactionRepository } from '../../testing/in-memory-transaction.repository.js';
import { UserNotFoundError } from '../transactions.errors.js';
import {
  GetTransactionHistoryUseCase,
  type HistoryRequester,
} from './get-transaction-history.use-case.js';

const ana: HistoryRequester = { id: 'ana', isAdmin: false };
const admin: HistoryRequester = { id: 'admin', isAdmin: true };

describe('GetTransactionHistoryUseCase', () => {
  let transactions: InMemoryTransactionRepository;
  let getHistory: GetTransactionHistoryUseCase;

  async function exchange(userId: string, at: string): Promise<void> {
    await transactions.save({
      userId,
      from: 'USD',
      to: 'PEN',
      amount: ExchangeAmount.create(100),
      convertedAmount: new Decimal('373.9'),
      appliedRate: new Decimal('3.739'),
      exchangeRateId: 'rate-1',
      createdAt: new Date(at),
    });
  }

  function historyOf(
    requester: HistoryRequester,
    options: { userId?: string; page?: number; limit?: number } = {},
  ): ReturnType<GetTransactionHistoryUseCase['execute']> {
    return getHistory.execute({
      requester,
      startDate: '2026-11-18',
      endDate: '2026-11-18',
      page: 1,
      limit: 20,
      ...options,
    });
  }

  beforeEach(async () => {
    transactions = new InMemoryTransactionRepository();
    getHistory = new GetTransactionHistoryUseCase(
      transactions,
      new FakeUserLookup(['ana', 'admin', 'bruno']),
    );
    await exchange('ana', '2026-11-18T10:00:00Z');
    await exchange('ana', '2026-11-18T20:00:00Z');
    await exchange('ana', '2026-11-19T04:59:00Z');
    await exchange('admin', '2026-11-18T12:00:00Z');
  });

  it('returns the newest transactions first', async () => {
    const { items, total } = await historyOf(ana);

    expect(total).toBe(3);
    expect(items.map((item) => item.createdAt.toISOString())).toEqual([
      '2026-11-19T04:59:00.000Z',
      '2026-11-18T20:00:00.000Z',
      '2026-11-18T10:00:00.000Z',
    ]);
  });

  it('only includes transactions within the Lima days requested', async () => {
    await exchange('ana', '2026-11-18T04:59:59Z');
    await exchange('ana', '2026-11-19T05:00:00Z');

    const { total } = await historyOf(ana);

    expect(total).toBe(3);
  });

  it('paginates while reporting the full total', async () => {
    const { items, total } = await historyOf(ana, { page: 2, limit: 2 });

    expect(total).toBe(3);
    expect(items.map((item) => item.createdAt.toISOString())).toEqual([
      '2026-11-18T10:00:00.000Z',
    ]);
  });

  it('ignores the userId of a regular user', async () => {
    const { items } = await historyOf(ana, { userId: 'admin' });

    expect(items.every((item) => item.userId === 'ana')).toBe(true);
    expect(items).toHaveLength(3);
  });

  it('shows an admin their own history when no userId is given', async () => {
    const { items } = await historyOf(admin);

    expect(items.map((item) => item.userId)).toEqual(['admin']);
  });

  it("shows an admin another user's history", async () => {
    const { items } = await historyOf(admin, { userId: 'ana' });

    expect(items).toHaveLength(3);
    expect(items.every((item) => item.userId === 'ana')).toBe(true);
  });

  it('returns an empty page for a user without transactions', async () => {
    await expect(historyOf(admin, { userId: 'bruno' })).resolves.toEqual({
      items: [],
      total: 0,
    });
  });

  it('fails when an admin asks for a user that does not exist', async () => {
    await expect(historyOf(admin, { userId: 'ghost' })).rejects.toBeInstanceOf(
      UserNotFoundError,
    );
    await expect(historyOf(admin, { userId: 'ghost' })).rejects.toMatchObject({
      code: 'USER_NOT_FOUND',
      kind: 'not_found',
    });
  });

  it.each([
    ['2026-11-19', '2026-11-18'],
    ['2026-02-30', '2026-03-02'],
  ])('rejects the range %s to %s', async (startDate, endDate) => {
    await expect(
      getHistory.execute({
        requester: ana,
        startDate,
        endDate,
        page: 1,
        limit: 20,
      }),
    ).rejects.toBeInstanceOf(InvalidDateRangeError);
  });
});
