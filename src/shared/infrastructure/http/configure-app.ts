import { type INestApplication, VersioningType } from '@nestjs/common';
import helmet from 'helmet';

import type { AppConfig } from '../config/app-config.js';

export function configureApp(app: INestApplication, config: AppConfig): void {
  app.use(helmet());
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
  app.enableCors({ origin: [...config.corsOrigins] });
  app.enableShutdownHooks();
}
