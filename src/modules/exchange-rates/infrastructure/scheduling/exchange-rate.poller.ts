import {
  type BeforeApplicationShutdown,
  Injectable,
  Logger,
  type OnApplicationBootstrap,
} from '@nestjs/common';

import { AppConfig } from '../../../../shared/infrastructure/config/app-config.js';
import { ExchangeRateProviderError } from '../../application/exchange-rates.errors.js';
import { RefreshExchangeRateUseCase } from '../../application/use-cases/refresh-exchange-rate.use-case.js';

function describeFailure(error: unknown): string {
  if (error instanceof ExchangeRateProviderError) {
    return error.reason;
  }
  return error instanceof Error ? error.message : String(error);
}

@Injectable()
export class ExchangeRatePoller
  implements OnApplicationBootstrap, BeforeApplicationShutdown
{
  private readonly logger = new Logger(ExchangeRatePoller.name);
  private timer: NodeJS.Timeout | undefined;
  private inFlight: Promise<void> | null = null;

  constructor(
    private readonly refreshExchangeRate: RefreshExchangeRateUseCase,
    private readonly config: AppConfig,
  ) {}

  onApplicationBootstrap(): void {
    void this.refresh();
    this.timer = setInterval(() => {
      void this.refresh();
    }, this.config.exchangeRateRefreshIntervalMs);
  }

  async beforeApplicationShutdown(): Promise<void> {
    clearInterval(this.timer);
    await this.inFlight;
  }

  refresh(): Promise<void> {
    this.inFlight ??= this.runRefresh().finally(() => {
      this.inFlight = null;
    });
    return this.inFlight;
  }

  private async runRefresh(): Promise<void> {
    try {
      await this.refreshExchangeRate.execute();
    } catch (error) {
      this.logger.warn(
        `Exchange rate refresh failed, keeping the last known rate: ${describeFailure(error)}`,
      );
    }
  }
}
