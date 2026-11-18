import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { Decimal } from 'decimal.js';

import { Transaction } from '../../../domain/entities/transaction.entity.js';
import { ExchangeAmount } from '../../../domain/value-objects/exchange-amount.vo.js';
import { CreateTransactionDto } from './create-transaction.dto.js';
import { TransactionDto } from './transaction.dto.js';
import { TransactionHistoryQueryDto } from './transaction-history-query.dto.js';

async function errorsFor(
  dtoClass: new () => object,
  plain: object,
): Promise<string[]> {
  const errors = await validate(plainToInstance(dtoClass, plain), {
    stopAtFirstError: true,
  });
  return errors.map((error) => error.property);
}

const validBody = { monedaOrigen: 'USD', monedaDestino: 'PEN', monto: 100 };

describe('CreateTransactionDto', () => {
  it('accepts the statement example', async () => {
    await expect(errorsFor(CreateTransactionDto, validBody)).resolves.toEqual(
      [],
    );
  });

  it.each(['100', null, true])(
    'rejects the non-numeric amount %j',
    async (monto) => {
      await expect(
        errorsFor(CreateTransactionDto, { ...validBody, monto }),
      ).resolves.toEqual(['monto']);
    },
  );

  it.each([1e-7, 1e2, 1e20, 0, -1, 1.234])(
    'leaves the range rules of the amount %j to the domain',
    async (monto) => {
      await expect(
        errorsFor(CreateTransactionDto, { ...validBody, monto }),
      ).resolves.toEqual([]);
    },
  );

  it('rejects an unsupported currency', async () => {
    await expect(
      errorsFor(CreateTransactionDto, { ...validBody, monedaOrigen: 'EUR' }),
    ).resolves.toEqual(['monedaOrigen']);
  });
});

describe('TransactionHistoryQueryDto', () => {
  const dates = { startDate: '2026-11-01', endDate: '2026-11-18' };

  it('applies default pagination', () => {
    const query = plainToInstance(TransactionHistoryQueryDto, dates);

    expect(query.page).toBe(1);
    expect(query.limit).toBe(20);
  });

  it('converts query string numbers', async () => {
    const query = plainToInstance(TransactionHistoryQueryDto, {
      ...dates,
      page: '3',
      limit: '50',
    });

    await expect(validate(query)).resolves.toEqual([]);
    expect(query.page).toBe(3);
  });

  it.each([
    [{ ...dates, userId: { $ne: 'x' } }, 'userId'],
    [{ ...dates, page: '10001' }, 'page'],
    [{ ...dates, limit: '101' }, 'limit'],
    [{ ...dates, page: '0' }, 'page'],
    [{ endDate: '2026-11-18' }, 'startDate'],
    [{ ...dates, endDate: '18-11-2026' }, 'endDate'],
  ])('rejects %j', async (plain, property) => {
    await expect(errorsFor(TransactionHistoryQueryDto, plain)).resolves.toEqual(
      [property],
    );
  });
});

describe('TransactionDto', () => {
  it('exposes the statement response shape', () => {
    const transaction = Transaction.restore({
      id: 'tx-1',
      userId: 'user-1',
      from: 'USD',
      to: 'PEN',
      amount: ExchangeAmount.create(100),
      convertedAmount: new Decimal('373.90'),
      appliedRate: new Decimal('3.739'),
      exchangeRateId: 'rate-1',
      createdAt: new Date('2026-11-18T15:00:00Z'),
    });

    expect(TransactionDto.fromEntity(transaction)).toEqual({
      id: 'tx-1',
      monedaOrigen: 'USD',
      monedaDestino: 'PEN',
      monto: 100,
      montoCambiado: 373.9,
      tipoCambio: 3.739,
      fecha: '2026-11-18T15:00:00.000Z',
    });
  });
});
