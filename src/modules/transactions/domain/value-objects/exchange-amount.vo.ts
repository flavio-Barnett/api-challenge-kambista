import { Decimal } from 'decimal.js';

import { InvalidAmountError } from '../transactions.errors.js';

const MAX_DECIMAL_PLACES = 2;
const UPPER_BOUND = new Decimal('10000000');

function toDecimal(value: Decimal.Value): Decimal {
  try {
    return new Decimal(value);
  } catch {
    throw new InvalidAmountError();
  }
}

export class ExchangeAmount {
  private constructor(readonly value: Decimal) {}

  static create(value: Decimal.Value): ExchangeAmount {
    const amount = toDecimal(value);
    const isValid =
      amount.isFinite() &&
      amount.greaterThan(0) &&
      amount.decimalPlaces() <= MAX_DECIMAL_PLACES &&
      amount.lessThan(UPPER_BOUND);
    if (!isValid) {
      throw new InvalidAmountError();
    }
    return new ExchangeAmount(amount);
  }
}
