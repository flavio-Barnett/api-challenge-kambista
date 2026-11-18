import { Decimal } from 'decimal.js';

import type { Currency } from '../types/currency.type.js';
import type { AppliedRate } from '../value-objects/applied-rate.vo.js';
import type { CurrencyPair } from '../value-objects/currency-pair.vo.js';
import type { ExchangeAmount } from '../value-objects/exchange-amount.vo.js';

const RESULT_DECIMAL_PLACES = 2;

export interface Conversion {
  readonly from: Currency;
  readonly to: Currency;
  readonly amount: ExchangeAmount;
  readonly convertedAmount: Decimal;
  readonly appliedRate: Decimal;
  readonly exchangeRateId: string;
}

export class CurrencyConverter {
  convert(
    amount: ExchangeAmount,
    pair: CurrencyPair,
    rate: AppliedRate,
  ): Conversion {
    const appliedRate = pair.isDollarsToSoles() ? rate.sell : rate.buy;
    const exact = pair.isDollarsToSoles()
      ? amount.value.times(appliedRate)
      : amount.value.dividedBy(appliedRate);
    return {
      from: pair.from,
      to: pair.to,
      amount,
      convertedAmount: exact.toDecimalPlaces(
        RESULT_DECIMAL_PLACES,
        Decimal.ROUND_HALF_UP,
      ),
      appliedRate,
      exchangeRateId: rate.exchangeRateId,
    };
  }
}
