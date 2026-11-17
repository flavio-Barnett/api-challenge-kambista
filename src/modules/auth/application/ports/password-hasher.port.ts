export abstract class PasswordHasher {
  abstract hash(plainPassword: string): Promise<string>;
  abstract matches(plainPassword: string, hash: string): Promise<boolean>;
}
