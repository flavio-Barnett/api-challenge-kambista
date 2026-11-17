export abstract class PasswordHasher {
  abstract hash(plainPassword: string): Promise<string>;
  abstract matches(plainPassword: string, hash: string): Promise<boolean>;
  abstract simulateMatch(plainPassword: string): Promise<void>;
}
