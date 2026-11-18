import { SameCurrencyError } from '../transactions.errors.js';
import type { Currency } from '../types/currency.type.js';

export class CurrencyPair {
  private constructor(
    readonly from: Currency,
    readonly to: Currency,
  ) {}

  static of(from: Currency, to: Currency): CurrencyPair {
    if (from === to) {
      throw new SameCurrencyError();
    }
    return new CurrencyPair(from, to);
  }

  isDollarsToSoles(): boolean {
    return this.from === 'USD';
  }
}
