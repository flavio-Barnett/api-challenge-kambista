export abstract class UserLookup {
  abstract exists(userId: string): Promise<boolean>;
}
