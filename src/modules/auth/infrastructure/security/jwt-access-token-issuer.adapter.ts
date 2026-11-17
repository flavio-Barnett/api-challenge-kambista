import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { AccessTokenIssuer } from '../../application/ports/access-token-issuer.port.js';
import type { User } from '../../domain/entities/user.entity.js';
import type { AccessTokenPayload } from './access-token-payload.type.js';

@Injectable()
export class JwtAccessTokenIssuerAdapter extends AccessTokenIssuer {
  constructor(private readonly jwt: JwtService) {
    super();
  }

  issue(user: User): Promise<string> {
    const payload: AccessTokenPayload = { sub: user.id, role: user.role };
    return this.jwt.signAsync(payload);
  }
}
