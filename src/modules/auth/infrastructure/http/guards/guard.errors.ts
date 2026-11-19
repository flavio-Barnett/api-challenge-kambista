import { DomainError } from '../../../../../shared/domain/domain-error.js';

export class InsufficientRoleError extends DomainError {
  readonly code = 'INSUFFICIENT_ROLE';
  readonly kind = 'forbidden';

  constructor() {
    super('No tienes permisos para realizar esta acción');
  }
}

export class OriginNotAllowedError extends DomainError {
  readonly code = 'ORIGIN_NOT_ALLOWED';
  readonly kind = 'forbidden';

  constructor() {
    super('El origen de la solicitud no está permitido');
  }
}
