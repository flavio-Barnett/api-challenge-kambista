export abstract class LoginAttemptsStore {
  abstract registerAttempt(
    key: string,
    now: Date,
    windowMs: number,
  ): Promise<number>;
  abstract reset(key: string): Promise<void>;
}
