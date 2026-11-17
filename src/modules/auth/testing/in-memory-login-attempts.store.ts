import { LoginAttemptsStore } from '../application/ports/login-attempts-store.port.js';

interface Attempts {
  count: number;
  expiresAt: Date;
}

export class InMemoryLoginAttemptsStore extends LoginAttemptsStore {
  private readonly attempts = new Map<string, Attempts>();

  registerAttempt(key: string, now: Date, windowMs: number): Promise<number> {
    const entry = this.attempts.get(key);
    if (entry && entry.expiresAt > now) {
      entry.count += 1;
      return Promise.resolve(entry.count);
    }
    this.attempts.set(key, {
      count: 1,
      expiresAt: new Date(now.getTime() + windowMs),
    });
    return Promise.resolve(1);
  }

  reset(key: string): Promise<void> {
    this.attempts.delete(key);
    return Promise.resolve();
  }
}
