import type { Clock } from '../../../../shared/domain/clock.port.js';
import type { User } from '../../domain/entities/user.entity.js';
import type { AccessTokenIssuer } from '../ports/access-token-issuer.port.js';
import type { RefreshTokenGenerator } from '../ports/refresh-token-generator.port.js';
import type { RefreshTokenStore } from '../ports/refresh-token-store.port.js';

export interface AuthSession {
  readonly user: User;
  readonly accessToken: string;
  readonly refreshToken: string;
}

export class SessionIssuerService {
  constructor(
    private readonly accessTokens: AccessTokenIssuer,
    private readonly refreshTokens: RefreshTokenGenerator,
    private readonly refreshTokenStore: RefreshTokenStore,
    private readonly clock: Clock,
    private readonly refreshTokenTtlMs: number,
  ) {}

  async start(user: User): Promise<AuthSession> {
    const accessToken = await this.accessTokens.issue(user);
    const refreshToken = this.refreshTokens.generate();
    await this.refreshTokenStore.save({
      tokenHash: this.refreshTokens.hash(refreshToken),
      userId: user.id,
      expiresAt: new Date(this.clock.now().getTime() + this.refreshTokenTtlMs),
    });
    return { user, accessToken, refreshToken };
  }
}
