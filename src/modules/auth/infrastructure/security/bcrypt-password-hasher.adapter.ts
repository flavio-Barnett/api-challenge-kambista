import { randomUUID } from 'node:crypto';

import { Injectable } from '@nestjs/common';
import bcrypt from 'bcrypt';

import { PasswordHasher } from '../../application/ports/password-hasher.port.js';

const BCRYPT_COST = 12;

@Injectable()
export class BcryptPasswordHasherAdapter extends PasswordHasher {
  private readonly decoyHash = bcrypt.hash(randomUUID(), BCRYPT_COST);

  hash(plainPassword: string): Promise<string> {
    return bcrypt.hash(plainPassword, BCRYPT_COST);
  }

  matches(plainPassword: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hash);
  }

  async simulateMatch(plainPassword: string): Promise<void> {
    await bcrypt.compare(plainPassword, await this.decoyHash);
  }
}
