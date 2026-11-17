import { createHash, randomBytes } from 'node:crypto';

import { Injectable } from '@nestjs/common';

import { RefreshTokenGenerator } from '../../application/ports/refresh-token-generator.port.js';

const TOKEN_BYTES = 32;

@Injectable()
export class OpaqueRefreshTokenGeneratorAdapter extends RefreshTokenGenerator {
  generate(): string {
    return randomBytes(TOKEN_BYTES).toString('base64url');
  }

  hash(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }
}
