import { RefreshTokenGenerator } from '../application/ports/refresh-token-generator.port.js';

export class FakeRefreshTokenGenerator extends RefreshTokenGenerator {
  private issued = 0;

  generate(): string {
    this.issued += 1;
    return `refresh-${String(this.issued)}`;
  }

  hash(token: string): string {
    return `hash:${token}`;
  }
}
