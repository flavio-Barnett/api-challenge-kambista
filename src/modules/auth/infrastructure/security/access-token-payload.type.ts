import type { Role } from '../../domain/types/role.type.js';

export interface AccessTokenPayload {
  readonly sub: string;
  readonly role: Role;
}
