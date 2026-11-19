import { VersioningType } from '@nestjs/common';
import type { NestExpressApplication } from '@nestjs/platform-express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';

import type { AppConfig } from '../config/app-config.js';

export function configureApp(
  app: NestExpressApplication,
  config: AppConfig,
): void {
  app.set('trust proxy', config.trustProxyHops);
  app.use(helmet());
  app.use(cookieParser());
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
  app.enableCors({
    origin: [...config.corsOrigins],
    credentials: true,
    exposedHeaders: ['X-Total-Count'],
  });
  app.enableShutdownHooks();
}
