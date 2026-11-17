import type { FactoryProvider, Provider } from '@nestjs/common';

import { AccessTokenIssuer } from './application/ports/access-token-issuer.port.js';
import { PasswordHasher } from './application/ports/password-hasher.port.js';
import { SessionIssuerService } from './application/services/session-issuer.service.js';
import { LogInUseCase } from './application/use-cases/log-in.use-case.js';
import { RegisterUserUseCase } from './application/use-cases/register-user.use-case.js';
import { UserRepository } from './domain/repositories/user.repository.js';
import { MongoUserRepository } from './infrastructure/persistence/mongo-user.repository.js';
import { BcryptPasswordHasherAdapter } from './infrastructure/security/bcrypt-password-hasher.adapter.js';
import { JwtAccessTokenIssuerAdapter } from './infrastructure/security/jwt-access-token-issuer.adapter.js';

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
  { provide: UserRepository, useClass: MongoUserRepository },
  { provide: PasswordHasher, useClass: BcryptPasswordHasherAdapter },
  { provide: AccessTokenIssuer, useClass: JwtAccessTokenIssuerAdapter },
];

const useCases: Provider[] = [
  useCase(SessionIssuerService, [AccessTokenIssuer]),
  useCase(RegisterUserUseCase, [
    UserRepository,
    PasswordHasher,
    SessionIssuerService,
  ]),
  useCase(LogInUseCase, [UserRepository, PasswordHasher, SessionIssuerService]),
];

export const authProviders: Provider[] = [...adapters, ...useCases];
