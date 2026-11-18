import type {
  ExchangeRate,
  NewExchangeRate,
} from '../entities/exchange-rate.entity.js';

export abstract class ExchangeRateRepository {
  abstract findCurrent(): Promise<ExchangeRate | null>;
  abstract save(rate: NewExchangeRate): Promise<ExchangeRate>;
  abstract confirm(
    id: string,
    providerDate: string,
    checkedAt: Date,
  ): Promise<void>;
}
