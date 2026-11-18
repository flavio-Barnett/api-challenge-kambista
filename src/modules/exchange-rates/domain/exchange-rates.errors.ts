import { DomainError } from '../../../shared/domain/domain-error.js';

export class InvalidExchangeRateError extends DomainError {
  readonly code = 'INVALID_EXCHANGE_RATE';
  readonly kind = 'validation';

  constructor() {
    super('El tipo de cambio recibido no es válido');
  }
}

export class ExchangeRateNotAvailableError extends DomainError {
  readonly code = 'EXCHANGE_RATE_NOT_AVAILABLE';
  readonly kind = 'unavailable';

  constructor() {
    super('El tipo de cambio no está disponible en este momento');
  }
}
