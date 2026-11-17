import { NestFactory } from '@nestjs/core';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module.js';
import { AppConfig } from './shared/infrastructure/config/app-config.js';
import { configureApp } from './shared/infrastructure/http/configure-app.js';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get(Logger));
  const config = app.get(AppConfig);
  configureApp(app, config);
  await app.listen(config.port);
}
await bootstrap();
