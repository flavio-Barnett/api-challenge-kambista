import { Injectable } from '@nestjs/common';

import { ExchangeRateCache } from '../../application/ports/exchange-rate-cache.port.js';
import type { ExchangeRate } from '../../domain/entities/exchange-rate.entity.js';

@Injectable()
export class InMemoryExchangeRateCacheAdapter extends ExchangeRateCache {
  private current: ExchangeRate | null = null;

  get(): ExchangeRate | null {
    return this.current;
  }

  keepLatest(rate: ExchangeRate): void {
    if (this.current?.isNewerThan(rate)) {
      return;
    }
    this.current = rate;
  }
}
