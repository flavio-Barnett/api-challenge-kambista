import { Logger } from '@nestjs/common';

import type { AppConfig } from '../../../../shared/infrastructure/config/app-config.js';
import { FixedClock } from '../../../../shared/testing/fixed-clock.js';
import { ExchangeRateProviderError } from '../../application/exchange-rates.errors.js';
import { RefreshExchangeRateUseCase } from '../../application/use-cases/refresh-exchange-rate.use-case.js';
import { FakeExchangeRateProvider } from '../../testing/fake-exchange-rate-provider.js';
import { InMemoryExchangeRateRepository } from '../../testing/in-memory-exchange-rate.repository.js';
import { InMemoryExchangeRateCacheAdapter } from '../cache/in-memory-exchange-rate-cache.adapter.js';
import { ExchangeRatePoller } from './exchange-rate.poller.js';

const INTERVAL_MS = 30 * 1000;
const config = { exchangeRateRefreshIntervalMs: INTERVAL_MS } as AppConfig;

describe('ExchangeRatePoller', () => {
  let provider: FakeExchangeRateProvider;
  let refreshExchangeRate: RefreshExchangeRateUseCase;
  let poller: ExchangeRatePoller;

  beforeEach(() => {
    provider = new FakeExchangeRateProvider();
    refreshExchangeRate = new RefreshExchangeRateUseCase(
      provider,
      new InMemoryExchangeRateRepository(),
      new InMemoryExchangeRateCacheAdapter(),
      new FixedClock(new Date('2026-11-17T12:00:00Z')),
    );
    poller = new ExchangeRatePoller(refreshExchangeRate, config);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('never runs two refreshes at the same time', async () => {
    const execute = vi.spyOn(refreshExchangeRate, 'execute');

    await Promise.all([poller.refresh(), poller.refresh()]);

    expect(execute).toHaveBeenCalledTimes(1);
  });

  it('logs a warning instead of throwing when the refresh fails', async () => {
    const warn = vi
      .spyOn(Logger.prototype, 'warn')
      .mockImplementation(() => undefined);
    provider.willFail(new ExchangeRateProviderError('TimeoutError'));

    await expect(poller.refresh()).resolves.toBeUndefined();
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('TimeoutError'));
  });

  it('refreshes on startup and on every interval until shutdown', async () => {
    vi.useFakeTimers();
    const execute = vi.spyOn(refreshExchangeRate, 'execute');

    poller.onApplicationBootstrap();
    await vi.advanceTimersByTimeAsync(INTERVAL_MS * 2);
    await poller.beforeApplicationShutdown();
    await vi.advanceTimersByTimeAsync(INTERVAL_MS * 2);

    expect(execute).toHaveBeenCalledTimes(3);
  });

  it('waits for an in-flight refresh before shutting down', async () => {
    let finishRefresh: () => void = () => undefined;
    vi.spyOn(refreshExchangeRate, 'execute').mockReturnValue(
      new Promise((resolve) => {
        finishRefresh = () => {
          resolve(undefined as never);
        };
      }),
    );
    let shutDown = false;

    const refreshing = poller.refresh();
    const shutdown = poller.beforeApplicationShutdown().then(() => {
      shutDown = true;
    });
    await Promise.resolve();
    expect(shutDown).toBe(false);
    finishRefresh();
    await Promise.all([refreshing, shutdown]);

    expect(shutDown).toBe(true);
  });
});
