import type { FactoryProvider, Provider } from '@nestjs/common';

import { PasswordHasher } from './application/ports/password-hasher.port.js';
import { RegisterUserUseCase } from './application/use-cases/register-user.use-case.js';
import { UserRepository } from './domain/repositories/user.repository.js';
import { MongoUserRepository } from './infrastructure/persistence/mongo-user.repository.js';
import { BcryptPasswordHasherAdapter } from './infrastructure/security/bcrypt-password-hasher.adapter.js';

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
];

const useCases: Provider[] = [
  useCase(RegisterUserUseCase, [UserRepository, PasswordHasher]),
];

export const authProviders: Provider[] = [...adapters, ...useCases];
