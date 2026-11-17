import { Module } from '@nestjs/common';
import { AppConfigModule } from './shared/infrastructure/config/app-config.module.js';
import { DatabaseModule } from './shared/infrastructure/database/database.module.js';

@Module({
  imports: [AppConfigModule, DatabaseModule],
})
export class AppModule {}
