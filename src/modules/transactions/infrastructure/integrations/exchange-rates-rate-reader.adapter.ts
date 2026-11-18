import { Injectable } from '@nestjs/common';

import { GetCurrentExchangeRateUseCase } from '../../../exchange-rates/application/use-cases/get-current-exchange-rate.use-case.js';
import { CurrentRateReader } from '../../application/ports/current-rate-reader.port.js';
import { AppliedRate } from '../../domain/value-objects/applied-rate.vo.js';

@Injectable()
export class ExchangeRatesRateReaderAdapter extends CurrentRateReader {
  constructor(
    private readonly getCurrentExchangeRate: GetCurrentExchangeRateUseCase,
  ) {
    super();
  }

  async read(): Promise<AppliedRate> {
    const rate = await this.getCurrentExchangeRate.execute();
    return AppliedRate.create(rate.id, rate.quote.buy, rate.quote.sell);
  }
}
