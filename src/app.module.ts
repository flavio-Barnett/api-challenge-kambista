import { Module } from '@nestjs/common';
import { AppConfigModule } from './shared/infrastructure/config/app-config.module.js';
import { DatabaseModule } from './shared/infrastructure/database/database.module.js';
import { httpProviders } from './shared/infrastructure/http/http.providers.js';
import { LoggingModule } from './shared/infrastructure/logging/logging.module.js';

@Module({
  imports: [AppConfigModule, LoggingModule, DatabaseModule],
  providers: [...httpProviders],
})
export class AppModule {}
