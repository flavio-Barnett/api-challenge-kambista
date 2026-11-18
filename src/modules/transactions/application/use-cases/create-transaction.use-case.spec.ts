import { FixedClock } from '../../../../shared/testing/fixed-clock.js';
import {
  InvalidAmountError,
  SameCurrencyError,
} from '../../domain/transactions.errors.js';
import { FakeCurrentRateReader } from '../../testing/fake-current-rate-reader.js';
import { InMemoryTransactionRepository } from '../../testing/in-memory-transaction.repository.js';
import { CreateTransactionUseCase } from './create-transaction.use-case.js';

class RateUnavailableError extends Error {}

describe('CreateTransactionUseCase', () => {
  let rates: FakeCurrentRateReader;
  let transactions: InMemoryTransactionRepository;
  let clock: FixedClock;
  let createTransaction: CreateTransactionUseCase;

  beforeEach(() => {
    rates = new FakeCurrentRateReader();
    transactions = new InMemoryTransactionRepository();
    clock = new FixedClock(new Date('2026-11-18T15:00:00Z'));
    createTransaction = new CreateTransactionUseCase(
      rates,
      transactions,
      clock,
    );
  });

  it('saves the exchange for the caller with the current rate', async () => {
    rates.willQuote('rate-9', '3.728', '3.739');

    const transaction = await createTransaction.execute({
      userId: 'user-1',
      from: 'USD',
      to: 'PEN',
      amount: 100,
    });

    expect(transactions.count).toBe(1);
    expect(transaction.userId).toBe('user-1');
    expect(transaction.convertedAmount.toNumber()).toBe(373.9);
    expect(transaction.appliedRate.toNumber()).toBe(3.739);
    expect(transaction.exchangeRateId).toBe('rate-9');
    expect(transaction.createdAt).toEqual(clock.now());
  });

  it('converts soles to dollars with the buy rate', async () => {
    const transaction = await createTransaction.execute({
      userId: 'user-1',
      from: 'PEN',
      to: 'USD',
      amount: 100,
    });

    expect(transaction.convertedAmount.toNumber()).toBe(26.82);
    expect(transaction.appliedRate.toNumber()).toBe(3.728);
  });

  it('rejects equal currencies before reading the rate', async () => {
    const read = vi.spyOn(rates, 'read');

    await expect(
      createTransaction.execute({
        userId: 'user-1',
        from: 'USD',
        to: 'USD',
        amount: 100,
      }),
    ).rejects.toBeInstanceOf(SameCurrencyError);
    expect(read).not.toHaveBeenCalled();
    expect(transactions.count).toBe(0);
  });

  it.each([0, -5, 1.234, 10_000_000])(
    'rejects the amount %d',
    async (amount) => {
      await expect(
        createTransaction.execute({
          userId: 'user-1',
          from: 'USD',
          to: 'PEN',
          amount,
        }),
      ).rejects.toBeInstanceOf(InvalidAmountError);
      expect(transactions.count).toBe(0);
    },
  );

  it('saves nothing when there is no exchange rate', async () => {
    rates.willFail(new RateUnavailableError());

    await expect(
      createTransaction.execute({
        userId: 'user-1',
        from: 'USD',
        to: 'PEN',
        amount: 100,
      }),
    ).rejects.toBeInstanceOf(RateUnavailableError);
    expect(transactions.count).toBe(0);
  });
});
