import { DomainError } from '../../../domain/domain-error.js';

export class InvalidAccessTokenError extends DomainError {
  readonly code = 'INVALID_ACCESS_TOKEN';
  readonly kind = 'unauthorized';

  constructor() {
    super('El token de acceso no es válido o expiró');
  }
}
