import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';

import { AppConfig } from '../../shared/infrastructure/config/app-config.js';
import { CheckUserExistsUseCase } from './application/use-cases/check-user-exists.use-case.js';
import { authProviders } from './auth.providers.js';
import { AuthController } from './infrastructure/http/auth.controller.js';
import { JwtAuthGuard } from './infrastructure/http/guards/jwt-auth.guard.js';
import { RolesGuard } from './infrastructure/http/guards/roles.guard.js';
import {
  LOGIN_ATTEMPT_MODEL,
  loginAttemptSchema,
} from './infrastructure/persistence/login-attempt.schema.js';
import {
  REFRESH_TOKEN_MODEL,
  refreshTokenSchema,
} from './infrastructure/persistence/refresh-token.schema.js';
import {
  USER_MODEL,
  userSchema,
} from './infrastructure/persistence/user.schema.js';
import { accessTokenJwtOptions } from './infrastructure/security/jwt-options.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: USER_MODEL, schema: userSchema },
      { name: REFRESH_TOKEN_MODEL, schema: refreshTokenSchema },
      { name: LOGIN_ATTEMPT_MODEL, schema: loginAttemptSchema },
    ]),
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
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    ...authProviders,
  ],
  exports: [CheckUserExistsUseCase],
})
export class AuthModule {}
