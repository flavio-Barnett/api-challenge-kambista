import { DomainError } from '../../../shared/domain/domain-error.js';

export class InvalidCredentialsError extends DomainError {
  readonly code = 'INVALID_CREDENTIALS';
  readonly kind = 'unauthorized';

  constructor() {
    super('Email o contraseña incorrectos');
  }
}

export class InvalidSessionError extends DomainError {
  readonly code = 'INVALID_SESSION';
  readonly kind = 'unauthorized';

  constructor() {
    super('La sesión ya no es válida');
  }
}
