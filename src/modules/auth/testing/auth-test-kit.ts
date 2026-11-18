import { FixedClock } from '../../../shared/testing/fixed-clock.js';
import { SessionIssuerService } from '../application/services/session-issuer.service.js';
import { FakeAccessTokenIssuer } from './fake-access-token-issuer.js';
import { FakePasswordHasher } from './fake-password-hasher.js';
import { FakeRefreshTokenGenerator } from './fake-refresh-token-generator.js';
import { InMemoryLoginAttemptsStore } from './in-memory-login-attempts.store.js';
import { InMemoryRefreshTokenStore } from './in-memory-refresh-token.store.js';
import { InMemoryUserRepository } from './in-memory-user.repository.js';

export const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export function createAuthTestKit(): {
  users: InMemoryUserRepository;
  passwordHasher: FakePasswordHasher;
  refreshTokens: FakeRefreshTokenGenerator;
  refreshTokenStore: InMemoryRefreshTokenStore;
  clock: FixedClock;
  sessions: SessionIssuerService;
  loginAttempts: InMemoryLoginAttemptsStore;
} {
  const refreshTokens = new FakeRefreshTokenGenerator();
  const refreshTokenStore = new InMemoryRefreshTokenStore();
  const clock = new FixedClock(new Date('2026-11-17T12:00:00Z'));
  return {
    users: new InMemoryUserRepository(),
    loginAttempts: new InMemoryLoginAttemptsStore(),
    passwordHasher: new FakePasswordHasher(),
    refreshTokens,
    refreshTokenStore,
    clock,
    sessions: new SessionIssuerService(
      new FakeAccessTokenIssuer(),
      refreshTokens,
      refreshTokenStore,
      clock,
      REFRESH_TOKEN_TTL_MS,
    ),
  };
}
