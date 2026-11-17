import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { Logger } from 'nestjs-pino';

import { AppModule } from './app.module.js';
import { AppConfig } from './shared/infrastructure/config/app-config.js';
import { configureApp } from './shared/infrastructure/http/configure-app.js';
import { setupSwagger } from './shared/infrastructure/http/swagger.setup.js';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
  });
  app.useLogger(app.get(Logger));
  const config = app.get(AppConfig);
  configureApp(app, config);
  setupSwagger(app);
  await app.listen(config.port);
}
await bootstrap();
