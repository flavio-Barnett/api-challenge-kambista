import { DomainError } from '../../../shared/domain/domain-error.js';

export class InvalidCredentialsError extends DomainError {
  readonly code = 'INVALID_CREDENTIALS';
  readonly kind = 'unauthorized';

  constructor() {
    super('Email o contraseña incorrectos');
  }
}
