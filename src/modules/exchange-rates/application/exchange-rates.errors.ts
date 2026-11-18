import { DomainError } from '../../../shared/domain/domain-error.js';

export class ExchangeRateProviderError extends DomainError {
  readonly code = 'EXCHANGE_RATE_PROVIDER_UNAVAILABLE';
  readonly kind = 'unavailable';

  constructor(readonly reason: string) {
    super('El proveedor del tipo de cambio no está disponible');
  }
}
