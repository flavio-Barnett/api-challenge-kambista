import { DomainError } from '../../../shared/domain/domain-error.js';

export class InvalidEmailError extends DomainError {
  readonly code = 'INVALID_EMAIL';
  readonly kind = 'validation';

  constructor() {
    super('El email no es válido');
  }
}

export class InvalidUserNameError extends DomainError {
  readonly code = 'INVALID_USER_NAME';
  readonly kind = 'validation';

  constructor() {
    super('El nombre debe tener entre 2 y 80 caracteres');
  }
}

export class EmailAlreadyRegisteredError extends DomainError {
  readonly code = 'EMAIL_ALREADY_REGISTERED';
  readonly kind = 'conflict';

  constructor() {
    super('El email ya está registrado');
  }
}

export class UserNotFoundError extends DomainError {
  readonly code = 'USER_NOT_FOUND';
  readonly kind = 'not_found';

  constructor() {
    super('El usuario no existe');
  }
}
