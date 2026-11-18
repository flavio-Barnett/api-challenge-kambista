import type { ExchangeRate } from '../../../domain/entities/exchange-rate.entity.js';

export class ExchangeRateDto {
  compra: number;
  venta: number;
  fecha: string;
  validFrom: string;
  lastCheckedAt: string;

  static fromEntity(rate: ExchangeRate): ExchangeRateDto {
    return {
      compra: rate.quote.buy.toNumber(),
      venta: rate.quote.sell.toNumber(),
      fecha: rate.quote.providerDate,
      validFrom: rate.validFrom.toISOString(),
      lastCheckedAt: rate.lastCheckedAt.toISOString(),
    };
  }
}
