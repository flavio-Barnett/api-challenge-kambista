import { Injectable } from '@nestjs/common';
import { z } from 'zod';

import { AppConfig } from '../../../../shared/infrastructure/config/app-config.js';
import { ExchangeRateProviderError } from '../../application/exchange-rates.errors.js';
import { ExchangeRateProvider } from '../../application/ports/exchange-rate-provider.port.js';
import { ExchangeRateQuote } from '../../domain/value-objects/exchange-rate-quote.vo.js';

const REQUEST_TIMEOUT_MS = 3000;

const sunatResponseSchema = z.object({
  compra: z.number().positive(),
  venta: z.number().positive(),
  moneda: z.literal('USD'),
  fecha: z.string(),
});

@Injectable()
export class SunatExchangeRateProviderAdapter extends ExchangeRateProvider {
  constructor(private readonly config: AppConfig) {
    super();
  }

  async fetchQuote(): Promise<ExchangeRateQuote> {
    const payload = await this.request();
    const parsed = sunatResponseSchema.safeParse(payload);
    if (!parsed.success) {
      throw new ExchangeRateProviderError('unexpected response format');
    }
    const { compra, venta, fecha } = parsed.data;
    return ExchangeRateQuote.create(compra, venta, fecha);
  }

  private async request(): Promise<unknown> {
    let response: Response;
    try {
      response = await fetch(this.config.exchangeRateProviderUrl, {
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });
    } catch (error) {
      throw new ExchangeRateProviderError(
        error instanceof Error ? error.name : 'request failed',
      );
    }
    if (!response.ok) {
      throw new ExchangeRateProviderError(`status ${String(response.status)}`);
    }
    return this.readJson(response);
  }

  private async readJson(response: Response): Promise<unknown> {
    try {
      return (await response.json()) as unknown;
    } catch {
      throw new ExchangeRateProviderError('invalid json');
    }
  }
}
