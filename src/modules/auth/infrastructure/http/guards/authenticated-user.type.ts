import type { Request } from 'express';

import type { Role } from '../../../domain/value-objects/role.vo.js';

export interface AuthenticatedUser {
  readonly id: string;
  readonly role: Role;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}
