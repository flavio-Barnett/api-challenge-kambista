export interface StoredRefreshToken {
  readonly tokenHash: string;
  readonly userId: string;
  readonly expiresAt: Date;
}

export abstract class RefreshTokenStore {
  abstract save(token: StoredRefreshToken): Promise<void>;
  abstract consume(tokenHash: string, now: Date): Promise<string | null>;
  abstract findRevokedOwner(tokenHash: string): Promise<string | null>;
  abstract revokeAllForUser(userId: string, now: Date): Promise<void>;
}
