import { Module } from '@nestjs/common';
import { AppConfigModule } from './shared/infrastructure/config/app-config.module.js';
import { DatabaseModule } from './shared/infrastructure/database/database.module.js';
import { LoggingModule } from './shared/infrastructure/logging/logging.module.js';

@Module({
  imports: [AppConfigModule, LoggingModule, DatabaseModule],
})
export class AppModule {}
