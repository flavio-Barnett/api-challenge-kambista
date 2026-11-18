import { Decimal } from 'decimal.js';

import { InvalidExchangeRateError } from '../exchange-rates.errors.js';

const PROVIDER_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function isCalendarDate(value: string): boolean {
  if (!PROVIDER_DATE_PATTERN.test(value)) {
    return false;
  }
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value);
}

export class ExchangeRateQuote {
  private constructor(
    readonly buy: Decimal,
    readonly sell: Decimal,
    readonly providerDate: string,
  ) {}

  static create(
    buy: Decimal.Value,
    sell: Decimal.Value,
    providerDate: string,
  ): ExchangeRateQuote {
    const buyRate = new Decimal(buy);
    const sellRate = new Decimal(sell);
    const isValid =
      buyRate.isPositive() &&
      !buyRate.isZero() &&
      buyRate.lessThanOrEqualTo(sellRate) &&
      isCalendarDate(providerDate);
    if (!isValid) {
      throw new InvalidExchangeRateError();
    }
    return new ExchangeRateQuote(buyRate, sellRate, providerDate);
  }

  hasSameRatesAs(other: ExchangeRateQuote): boolean {
    return this.buy.equals(other.buy) && this.sell.equals(other.sell);
  }
}
