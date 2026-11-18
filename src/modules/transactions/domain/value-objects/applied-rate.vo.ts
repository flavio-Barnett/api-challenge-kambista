import { Decimal } from 'decimal.js';

export class AppliedRate {
  private constructor(
    readonly exchangeRateId: string,
    readonly buy: Decimal,
    readonly sell: Decimal,
  ) {}

  static create(
    exchangeRateId: string,
    buy: Decimal.Value,
    sell: Decimal.Value,
  ): AppliedRate {
    return new AppliedRate(exchangeRateId, new Decimal(buy), new Decimal(sell));
  }
}
