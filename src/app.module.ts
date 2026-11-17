import { Module } from '@nestjs/common';
import { AppConfigModule } from './shared/infrastructure/config/app-config.module.js';

@Module({
  imports: [AppConfigModule],
})
export class AppModule {}
