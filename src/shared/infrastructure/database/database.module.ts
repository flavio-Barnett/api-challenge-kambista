import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AppConfig } from '../config/app-config.js';

const SERVER_SELECTION_TIMEOUT_MS = 5000;

@Module({
  imports: [
    MongooseModule.forRootAsync({
      inject: [AppConfig],
      useFactory: (config: AppConfig) => ({
        uri: config.mongoUri,
        autoIndex: true,
        serverSelectionTimeoutMS: SERVER_SELECTION_TIMEOUT_MS,
        retryAttempts: 0,
      }),
    }),
  ],
})
export class DatabaseModule {}
