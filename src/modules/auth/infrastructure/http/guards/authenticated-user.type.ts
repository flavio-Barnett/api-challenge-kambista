import type { Request } from 'express';

import type { RequestUser } from '../../../../../shared/infrastructure/http/request-user.js';
import type { Role } from '../../../domain/types/role.type.js';

export interface AuthenticatedUser extends RequestUser {
  readonly role: Role;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}
