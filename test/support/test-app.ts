import type { Server } from 'node:http';

import type { NestExpressApplication } from '@nestjs/platform-express';
import { Test } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';

import { ExchangeRateProvider } from '../../src/modules/exchange-rates/application/ports/exchange-rate-provider.port.js';
import { ExchangeRatePoller } from '../../src/modules/exchange-rates/infrastructure/scheduling/exchange-rate.poller.js';
import { FakeExchangeRateProvider } from '../../src/modules/exchange-rates/testing/fake-exchange-rate-provider.js';
import { Clock } from '../../src/shared/domain/clock.port.js';
import { ControllableClock } from './controllable-clock.js';

export interface TestApp {
  readonly server: Server;
  readonly rates: FakeExchangeRateProvider;
  readonly clock: ControllableClock;
  refreshRate(): Promise<void>;
  get<T>(token: abstract new (...args: never) => T): T;
  close(): Promise<void>;
}

export const ALLOWED_ORIGIN = 'http://localhost:3001';

interface TestAppOptions {
  readonly trustProxyHops?: number;
}

function configureEnvironment(mongoUri: string, options: TestAppOptions): void {
  process.env.NODE_ENV = 'test';
  process.env.MONGODB_URI = mongoUri;
  process.env.JWT_ACCESS_SECRET = 'e2e-secret-with-at-least-32-characters';
  process.env.EXCHANGE_RATE_REFRESH_INTERVAL_MS = String(60 * 60 * 1000);
  process.env.CORS_ORIGINS = ALLOWED_ORIGIN;
  process.env.TRUST_PROXY_HOPS = String(options.trustProxyHops ?? 0);
}

async function createApp(
  rates: FakeExchangeRateProvider,
  clock: ControllableClock,
): Promise<NestExpressApplication> {
  const { AppModule } = await import('../../src/app.module.js');
  const { AppConfig } =
    await import('../../src/shared/infrastructure/config/app-config.js');
  const { configureApp } =
    await import('../../src/shared/infrastructure/http/configure-app.js');
  const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
    .overrideProvider(ExchangeRateProvider)
    .useValue(rates)
    .overrideProvider(Clock)
    .useValue(clock)
    .compile();
  const app = moduleRef.createNestApplication<NestExpressApplication>({
    logger: false,
  });
  configureApp(app, app.get(AppConfig));
  await app.init();
  return app;
}

export async function startTestApp(
  options: TestAppOptions = {},
): Promise<TestApp> {
  const mongo = await MongoMemoryServer.create();
  configureEnvironment(mongo.getUri('kambista'), options);
  const rates = new FakeExchangeRateProvider();
  rates.willFail(new Error('Exchange rate provider is not ready'));
  const clock = new ControllableClock();
  const app = await createApp(rates, clock);
  const poller = app.get(ExchangeRatePoller);
  await poller.refresh();
  return {
    server: app.getHttpServer(),
    rates,
    clock,
    refreshRate: () => poller.refresh(),
    get: (token) => app.get(token),
    close: async () => {
      await app.close();
      await mongo.stop();
    },
  };
}
