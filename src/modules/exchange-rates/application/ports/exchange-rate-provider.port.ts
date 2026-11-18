import type { ExchangeRateQuote } from '../../domain/value-objects/exchange-rate-quote.vo.js';

export abstract class ExchangeRateProvider {
  abstract fetchQuote(): Promise<ExchangeRateQuote>;
}
