import type { ExchangeRateQuote } from '../value-objects/exchange-rate-quote.vo.js';

export interface ExchangeRateProps {
  readonly id: string;
  readonly quote: ExchangeRateQuote;
  readonly validFrom: Date;
  readonly lastCheckedAt: Date;
}

export type NewExchangeRate = Omit<ExchangeRateProps, 'id'>;

export class ExchangeRate {
  private constructor(private readonly props: ExchangeRateProps) {}

  static restore(props: ExchangeRateProps): ExchangeRate {
    return new ExchangeRate(props);
  }

  static publish(quote: ExchangeRateQuote, now: Date): NewExchangeRate {
    return { quote, validFrom: now, lastCheckedAt: now };
  }

  get id(): string {
    return this.props.id;
  }

  get quote(): ExchangeRateQuote {
    return this.props.quote;
  }

  get validFrom(): Date {
    return this.props.validFrom;
  }

  get lastCheckedAt(): Date {
    return this.props.lastCheckedAt;
  }

  matches(quote: ExchangeRateQuote): boolean {
    return this.props.quote.hasSameRatesAs(quote);
  }

  confirm(quote: ExchangeRateQuote, now: Date): ExchangeRate {
    return new ExchangeRate({ ...this.props, quote, lastCheckedAt: now });
  }

  isNewerThan(other: ExchangeRate): boolean {
    return this.props.validFrom > other.validFrom;
  }
}
