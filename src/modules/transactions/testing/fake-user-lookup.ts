import { UserLookup } from '../application/ports/user-lookup.port.js';

export class FakeUserLookup extends UserLookup {
  constructor(private readonly registered: readonly string[] = []) {
    super();
  }

  exists(userId: string): Promise<boolean> {
    return Promise.resolve(this.registered.includes(userId));
  }
}
