import type { AuthSession } from '../../../application/services/session-issuer.service.js';

export class AccessTokenDto {
  access_token: string;

  static fromSession(session: AuthSession): AccessTokenDto {
    return { access_token: session.accessToken };
  }
}
