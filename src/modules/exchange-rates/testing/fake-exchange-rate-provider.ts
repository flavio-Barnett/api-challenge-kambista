import { ExchangeRateProvider } from '../application/ports/exchange-rate-provider.port.js';
import { ExchangeRateQuote } from '../domain/value-objects/exchange-rate-quote.vo.js';

export class FakeExchangeRateProvider extends ExchangeRateProvider {
  private next: () => Promise<ExchangeRateQuote> = () =>
    Promise.resolve(ExchangeRateQuote.create('3.408', '3.419', '2026-11-17'));

  willQuote(buy: string, sell: string, providerDate = '2026-11-17'): void {
    this.next = () =>
      Promise.resolve(ExchangeRateQuote.create(buy, sell, providerDate));
  }

  willFail(error: Error): void {
    this.next = () => Promise.reject(error);
  }

  fetchQuote(): Promise<ExchangeRateQuote> {
    return this.next();
  }
}
