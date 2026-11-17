import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';

import { AppConfig } from '../../shared/infrastructure/config/app-config.js';
import { authProviders } from './auth.providers.js';
import { AuthController } from './infrastructure/http/auth.controller.js';
import {
  USER_MODEL,
  userSchema,
} from './infrastructure/persistence/user.schema.js';
import { accessTokenJwtOptions } from './infrastructure/security/jwt-options.js';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: USER_MODEL, schema: userSchema }]),
    JwtModule.registerAsync({
      inject: [AppConfig],
      useFactory: (config: AppConfig) =>
        accessTokenJwtOptions(
          config.accessToken.secret,
          config.accessToken.ttlMs,
        ),
    }),
  ],
  controllers: [AuthController],
  providers: authProviders,
})
export class AuthModule {}
