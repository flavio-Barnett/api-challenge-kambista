import type { Role } from '../../../../shared/domain/role.type.js';

export interface AccessTokenPayload {
  readonly sub: string;
  readonly role: Role;
}
