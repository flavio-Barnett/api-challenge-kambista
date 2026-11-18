import type { Clock } from '../../../../shared/domain/clock.port.js';
import { Transaction } from '../../domain/entities/transaction.entity.js';
import type { TransactionRepository } from '../../domain/repositories/transaction.repository.js';
import { CurrencyConverter } from '../../domain/services/currency-converter.service.js';
import type { Currency } from '../../domain/types/currency.type.js';
import { CurrencyPair } from '../../domain/value-objects/currency-pair.vo.js';
import { ExchangeAmount } from '../../domain/value-objects/exchange-amount.vo.js';
import type { CurrentRateReader } from '../ports/current-rate-reader.port.js';

export interface CreateTransactionInput {
  readonly userId: string;
  readonly from: Currency;
  readonly to: Currency;
  readonly amount: number | string;
}

export class CreateTransactionUseCase {
  private readonly converter = new CurrencyConverter();

  constructor(
    private readonly rates: CurrentRateReader,
    private readonly transactions: TransactionRepository,
    private readonly clock: Clock,
  ) {}

  async execute(input: CreateTransactionInput): Promise<Transaction> {
    const amount = ExchangeAmount.create(input.amount);
    const pair = CurrencyPair.of(input.from, input.to);
    const rate = await this.rates.read();
    const conversion = this.converter.convert(amount, pair, rate);
    return this.transactions.save(
      Transaction.fromConversion(input.userId, conversion, this.clock.now()),
    );
  }
}
