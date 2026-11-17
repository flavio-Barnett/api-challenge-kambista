import type { Clock } from '../../../../shared/domain/clock.port.js';
import type { UserRepository } from '../../domain/repositories/user.repository.js';
import { InvalidRefreshTokenError } from '../auth.errors.js';
import type { RefreshTokenGenerator } from '../ports/refresh-token-generator.port.js';
import type { RefreshTokenStore } from '../ports/refresh-token-store.port.js';
import type {
  AuthSession,
  SessionIssuerService,
} from '../services/session-issuer.service.js';

export class RefreshSessionUseCase {
  constructor(
    private readonly users: UserRepository,
    private readonly refreshTokens: RefreshTokenGenerator,
    private readonly refreshTokenStore: RefreshTokenStore,
    private readonly sessions: SessionIssuerService,
    private readonly clock: Clock,
  ) {}

  async execute(refreshToken: string): Promise<AuthSession> {
    const tokenHash = this.refreshTokens.hash(refreshToken);
    const now = this.clock.now();
    const userId = await this.refreshTokenStore.consume(tokenHash, now);
    if (!userId) {
      await this.revokeFamilyIfReused(tokenHash, now);
      throw new InvalidRefreshTokenError();
    }
    const user = await this.users.findById(userId);
    if (!user) {
      throw new InvalidRefreshTokenError();
    }
    return this.sessions.start(user);
  }

  private async revokeFamilyIfReused(
    tokenHash: string,
    now: Date,
  ): Promise<void> {
    const ownerId = await this.refreshTokenStore.findRevokedOwner(tokenHash);
    if (ownerId) {
      await this.refreshTokenStore.revokeAllForUser(ownerId, now);
    }
  }
}
