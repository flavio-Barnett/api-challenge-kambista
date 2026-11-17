import { Injectable } from '@nestjs/common';
import bcrypt from 'bcrypt';

import { PasswordHasher } from '../../application/ports/password-hasher.port.js';

const BCRYPT_COST = 12;

@Injectable()
export class BcryptPasswordHasherAdapter extends PasswordHasher {
  hash(plainPassword: string): Promise<string> {
    return bcrypt.hash(plainPassword, BCRYPT_COST);
  }

  matches(plainPassword: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hash);
  }
}
