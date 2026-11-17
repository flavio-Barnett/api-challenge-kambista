import type { Clock } from '../../../../shared/domain/clock.port.js';
import type { RefreshTokenGenerator } from '../ports/refresh-token-generator.port.js';
import type { RefreshTokenStore } from '../ports/refresh-token-store.port.js';

export class LogOutUseCase {
  constructor(
    private readonly refreshTokens: RefreshTokenGenerator,
    private readonly refreshTokenStore: RefreshTokenStore,
    private readonly clock: Clock,
  ) {}

  async execute(refreshToken: string): Promise<void> {
    await this.refreshTokenStore.consume(
      this.refreshTokens.hash(refreshToken),
      this.clock.now(),
    );
  }
}
