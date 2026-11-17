import type { FactoryProvider, Provider } from '@nestjs/common';

import { Clock } from '../../shared/domain/clock.port.js';
import { AppConfig } from '../../shared/infrastructure/config/app-config.js';
import { SystemClockAdapter } from '../../shared/infrastructure/time/system-clock.adapter.js';
import { AccessTokenIssuer } from './application/ports/access-token-issuer.port.js';
import { LoginAttemptsStore } from './application/ports/login-attempts-store.port.js';
import { PasswordHasher } from './application/ports/password-hasher.port.js';
import { RefreshTokenGenerator } from './application/ports/refresh-token-generator.port.js';
import { RefreshTokenStore } from './application/ports/refresh-token-store.port.js';
import { SessionIssuerService } from './application/services/session-issuer.service.js';
import { GetCurrentUserUseCase } from './application/use-cases/get-current-user.use-case.js';
import { LogInUseCase } from './application/use-cases/log-in.use-case.js';
import { LogOutUseCase } from './application/use-cases/log-out.use-case.js';
import { RefreshSessionUseCase } from './application/use-cases/refresh-session.use-case.js';
import { RegisterUserUseCase } from './application/use-cases/register-user.use-case.js';
import { UserRepository } from './domain/repositories/user.repository.js';
import { MongoLoginAttemptsStore } from './infrastructure/persistence/mongo-login-attempts.store.js';
import { MongoRefreshTokenStore } from './infrastructure/persistence/mongo-refresh-token.store.js';
import { MongoUserRepository } from './infrastructure/persistence/mongo-user.repository.js';
import { BcryptPasswordHasherAdapter } from './infrastructure/security/bcrypt-password-hasher.adapter.js';
import { JwtAccessTokenIssuerAdapter } from './infrastructure/security/jwt-access-token-issuer.adapter.js';
import { OpaqueRefreshTokenGeneratorAdapter } from './infrastructure/security/opaque-refresh-token-generator.adapter.js';

type Token<T> = abstract new (...args: never) => T;

function useCase<T, Deps extends unknown[]>(
  useCaseClass: new (...deps: Deps) => T,
  dependencies: { [K in keyof Deps]: Token<Deps[K]> },
): FactoryProvider<T> {
  return {
    provide: useCaseClass,
    inject: [...dependencies],
    useFactory: (...deps: Deps) => new useCaseClass(...deps),
  };
}

const adapters: Provider[] = [
  { provide: Clock, useClass: SystemClockAdapter },
  { provide: UserRepository, useClass: MongoUserRepository },
  { provide: PasswordHasher, useClass: BcryptPasswordHasherAdapter },
  { provide: AccessTokenIssuer, useClass: JwtAccessTokenIssuerAdapter },
  {
    provide: RefreshTokenGenerator,
    useClass: OpaqueRefreshTokenGeneratorAdapter,
  },
  { provide: RefreshTokenStore, useClass: MongoRefreshTokenStore },
  { provide: LoginAttemptsStore, useClass: MongoLoginAttemptsStore },
];

const sessionIssuer: FactoryProvider<SessionIssuerService> = {
  provide: SessionIssuerService,
  inject: [
    AccessTokenIssuer,
    RefreshTokenGenerator,
    RefreshTokenStore,
    Clock,
    AppConfig,
  ],
  useFactory: (
    accessTokens: AccessTokenIssuer,
    refreshTokens: RefreshTokenGenerator,
    store: RefreshTokenStore,
    clock: Clock,
    config: AppConfig,
  ) =>
    new SessionIssuerService(
      accessTokens,
      refreshTokens,
      store,
      clock,
      config.refreshTokenTtlMs,
    ),
};

const useCases: Provider[] = [
  useCase(RegisterUserUseCase, [
    UserRepository,
    PasswordHasher,
    SessionIssuerService,
  ]),
  useCase(LogInUseCase, [
    UserRepository,
    PasswordHasher,
    SessionIssuerService,
    LoginAttemptsStore,
    Clock,
  ]),
  useCase(RefreshSessionUseCase, [
    UserRepository,
    RefreshTokenGenerator,
    RefreshTokenStore,
    SessionIssuerService,
    Clock,
  ]),
  useCase(LogOutUseCase, [RefreshTokenGenerator, RefreshTokenStore, Clock]),
  useCase(GetCurrentUserUseCase, [UserRepository]),
];

export const authProviders: Provider[] = [
  ...adapters,
  sessionIssuer,
  ...useCases,
];
