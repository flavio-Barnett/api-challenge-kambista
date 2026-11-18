import { DomainError } from '../../../shared/domain/domain-error.js';

export class UserNotFoundError extends DomainError {
  readonly code = 'USER_NOT_FOUND';
  readonly kind = 'not_found';

  constructor() {
    super('El usuario no existe');
  }
}
