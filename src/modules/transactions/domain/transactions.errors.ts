import { DomainError } from '../../../shared/domain/domain-error.js';

export class InvalidAmountError extends DomainError {
  readonly code = 'INVALID_AMOUNT';
  readonly kind = 'validation';

  constructor() {
    super(
      'El monto debe ser mayor a 0, tener como máximo 2 decimales y no superar 9,999,999.99',
    );
  }
}

export class SameCurrencyError extends DomainError {
  readonly code = 'SAME_CURRENCY';
  readonly kind = 'validation';

  constructor() {
    super('La moneda de origen y la de destino deben ser distintas');
  }
}

export class InvalidDateRangeError extends DomainError {
  readonly code = 'INVALID_DATE_RANGE';
  readonly kind = 'validation';

  constructor() {
    super(
      'El rango de fechas no es válido: usa fechas reales en formato YYYY-MM-DD y una fecha de inicio que no sea posterior a la de fin',
    );
  }
}
