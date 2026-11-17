import { SessionIssuerService } from '../application/services/session-issuer.service.js';
import { FakeAccessTokenIssuer } from './fake-access-token-issuer.js';
import { FakePasswordHasher } from './fake-password-hasher.js';
import { InMemoryUserRepository } from './in-memory-user.repository.js';

export function createAuthTestKit(): {
  users: InMemoryUserRepository;
  passwordHasher: FakePasswordHasher;
  sessions: SessionIssuerService;
} {
  return {
    users: new InMemoryUserRepository(),
    passwordHasher: new FakePasswordHasher(),
    sessions: new SessionIssuerService(new FakeAccessTokenIssuer()),
  };
}
