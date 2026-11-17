import { AccessTokenIssuer } from '../application/ports/access-token-issuer.port.js';
import type { User } from '../domain/entities/user.entity.js';

export class FakeAccessTokenIssuer extends AccessTokenIssuer {
  issue(user: User): Promise<string> {
    return Promise.resolve(`access-token:${user.id}`);
  }
}
