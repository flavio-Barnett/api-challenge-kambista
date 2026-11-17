import { DomainError } from '../../../../../shared/domain/domain-error.js';

export class InvalidAccessTokenError extends DomainError {
  readonly code = 'INVALID_ACCESS_TOKEN';
  readonly kind = 'unauthorized';

  constructor() {
    super('El token de acceso no es válido o expiró');
  }
}

export class InsufficientRoleError extends DomainError {
  readonly code = 'INSUFFICIENT_ROLE';
  readonly kind = 'forbidden';

  constructor() {
    super('No tienes permisos para realizar esta acción');
  }
}
