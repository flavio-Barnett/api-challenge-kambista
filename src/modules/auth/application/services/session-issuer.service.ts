import type { User } from '../../domain/entities/user.entity.js';
import type { AccessTokenIssuer } from '../ports/access-token-issuer.port.js';

export interface AuthSession {
  readonly user: User;
  readonly accessToken: string;
}

export class SessionIssuerService {
  constructor(private readonly accessTokens: AccessTokenIssuer) {}

  async start(user: User): Promise<AuthSession> {
    return { user, accessToken: await this.accessTokens.issue(user) };
  }
}
