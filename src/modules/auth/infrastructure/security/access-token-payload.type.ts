import type { Role } from '../../domain/value-objects/role.vo.js';

export interface AccessTokenPayload {
  readonly sub: string;
  readonly role: Role;
}
