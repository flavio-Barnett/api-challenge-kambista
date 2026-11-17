import { Module } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino';
import { AppConfig } from '../config/app-config.js';
import { buildLoggerParams } from './logger.params.js';

@Module({
  imports: [
    LoggerModule.forRootAsync({
      inject: [AppConfig],
      useFactory: (config: AppConfig) => buildLoggerParams(config.nodeEnv),
    }),
  ],
})
export class LoggingModule {}
