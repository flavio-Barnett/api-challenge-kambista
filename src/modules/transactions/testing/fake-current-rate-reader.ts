import { CurrentRateReader } from '../application/ports/current-rate-reader.port.js';
import { AppliedRate } from '../domain/value-objects/applied-rate.vo.js';

export class FakeCurrentRateReader extends CurrentRateReader {
  private next: () => Promise<AppliedRate> = () =>
    Promise.resolve(AppliedRate.create('rate-1', '3.728', '3.739'));

  willQuote(exchangeRateId: string, buy: string, sell: string): void {
    this.next = () =>
      Promise.resolve(AppliedRate.create(exchangeRateId, buy, sell));
  }

  willFail(error: Error): void {
    this.next = () => Promise.reject(error);
  }

  read(): Promise<AppliedRate> {
    return this.next();
  }
}
