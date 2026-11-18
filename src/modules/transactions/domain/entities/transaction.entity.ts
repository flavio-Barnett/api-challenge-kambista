import type { Decimal } from 'decimal.js';

import type { Conversion } from '../services/currency-converter.service.js';
import type { Currency } from '../types/currency.type.js';
import type { ExchangeAmount } from '../value-objects/exchange-amount.vo.js';

export interface TransactionProps {
  readonly id: string;
  readonly userId: string;
  readonly from: Currency;
  readonly to: Currency;
  readonly amount: ExchangeAmount;
  readonly convertedAmount: Decimal;
  readonly appliedRate: Decimal;
  readonly exchangeRateId: string;
  readonly createdAt: Date;
}

export type NewTransaction = Omit<TransactionProps, 'id'>;

export class Transaction {
  private constructor(private readonly props: TransactionProps) {}

  static restore(props: TransactionProps): Transaction {
    return new Transaction(props);
  }

  static fromConversion(
    userId: string,
    conversion: Conversion,
    now: Date,
  ): NewTransaction {
    return { userId, ...conversion, createdAt: now };
  }

  get id(): string {
    return this.props.id;
  }

  get userId(): string {
    return this.props.userId;
  }

  get from(): Currency {
    return this.props.from;
  }

  get to(): Currency {
    return this.props.to;
  }

  get amount(): ExchangeAmount {
    return this.props.amount;
  }

  get convertedAmount(): Decimal {
    return this.props.convertedAmount;
  }

  get appliedRate(): Decimal {
    return this.props.appliedRate;
  }

  get exchangeRateId(): string {
    return this.props.exchangeRateId;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }
}
