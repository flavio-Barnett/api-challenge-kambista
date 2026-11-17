import { PasswordHasher } from '../application/ports/password-hasher.port.js';

export class FakePasswordHasher extends PasswordHasher {
  hash(plainPassword: string): Promise<string> {
    return Promise.resolve(`hashed:${plainPassword}`);
  }

  matches(plainPassword: string, hash: string): Promise<boolean> {
    return Promise.resolve(hash === `hashed:${plainPassword}`);
  }

  simulateMatch(): Promise<void> {
    return Promise.resolve();
  }
}
