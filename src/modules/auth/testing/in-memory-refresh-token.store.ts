import {
  RefreshTokenStore,
  type StoredRefreshToken,
} from '../application/ports/refresh-token-store.port.js';

interface StoredEntry extends StoredRefreshToken {
  revokedAt: Date | null;
}

export class InMemoryRefreshTokenStore extends RefreshTokenStore {
  private readonly tokens: StoredEntry[] = [];

  save(token: StoredRefreshToken): Promise<void> {
    this.tokens.push({ ...token, revokedAt: null });
    return Promise.resolve();
  }

  consume(tokenHash: string, now: Date): Promise<string | null> {
    const token = this.tokens.find(
      (entry) =>
        entry.tokenHash === tokenHash &&
        entry.revokedAt === null &&
        entry.expiresAt > now,
    );
    if (!token) {
      return Promise.resolve(null);
    }
    token.revokedAt = now;
    return Promise.resolve(token.userId);
  }

  findRevokedOwner(tokenHash: string): Promise<string | null> {
    const token = this.tokens.find(
      (entry) => entry.tokenHash === tokenHash && entry.revokedAt !== null,
    );
    return Promise.resolve(token?.userId ?? null);
  }

  revokeAllForUser(userId: string, now: Date): Promise<void> {
    this.tokens
      .filter((entry) => entry.userId === userId && entry.revokedAt === null)
      .forEach((entry) => {
        entry.revokedAt = now;
      });
    return Promise.resolve();
  }

  activeTokensOf(userId: string): number {
    return this.tokens.filter(
      (entry) => entry.userId === userId && entry.revokedAt === null,
    ).length;
  }
}
