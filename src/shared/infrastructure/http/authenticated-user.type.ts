import type { Request } from 'express';

import type { Role } from '../../domain/role.type.js';
import type { RequestUser } from './request-user.js';

export interface AuthenticatedUser extends RequestUser {
  readonly role: Role;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}
