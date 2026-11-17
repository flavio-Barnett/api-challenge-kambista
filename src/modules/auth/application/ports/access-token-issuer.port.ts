import type { User } from '../../domain/entities/user.entity.js';

export abstract class AccessTokenIssuer {
  abstract issue(user: User): Promise<string>;
}
