import type { INestApplication } from '@nestjs/common';
import helmet from 'helmet';

import type { AppConfig } from '../config/app-config.js';

export function configureApp(app: INestApplication, config: AppConfig): void {
  app.use(helmet());
  app.enableCors({ origin: [...config.corsOrigins] });
  app.enableShutdownHooks();
}
