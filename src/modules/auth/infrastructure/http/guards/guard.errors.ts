import { DomainError } from '../../../../../shared/domain/domain-error.js';

export class InsufficientRoleError extends DomainError {
  readonly code = 'INSUFFICIENT_ROLE';
  readonly kind = 'forbidden';

  constructor() {
    super('No tienes permisos para realizar esta acción');
  }
}
