import {
  ExchangeRate,
  type NewExchangeRate,
} from '../domain/entities/exchange-rate.entity.js';
import { ExchangeRateRepository } from '../domain/repositories/exchange-rate.repository.js';
import { ExchangeRateQuote } from '../domain/value-objects/exchange-rate-quote.vo.js';

export class InMemoryExchangeRateRepository extends ExchangeRateRepository {
  private rates: ExchangeRate[] = [];

  get versions(): number {
    return this.rates.length;
  }

  findCurrent(): Promise<ExchangeRate | null> {
    return Promise.resolve(this.rates.at(-1) ?? null);
  }

  save(rate: NewExchangeRate): Promise<ExchangeRate> {
    const saved = ExchangeRate.restore({
      id: String(this.rates.length + 1),
      ...rate,
    });
    this.rates.push(saved);
    return Promise.resolve(saved);
  }

  confirm(id: string, providerDate: string, checkedAt: Date): Promise<void> {
    this.rates = this.rates.map((rate) =>
      rate.id === id
        ? rate.confirm(
            ExchangeRateQuote.create(
              rate.quote.buy,
              rate.quote.sell,
              providerDate,
            ),
            checkedAt,
          )
        : rate,
    );
    return Promise.resolve();
  }
}
