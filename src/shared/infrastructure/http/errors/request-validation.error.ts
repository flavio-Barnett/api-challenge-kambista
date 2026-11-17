import type { ValidationError } from 'class-validator';

import { DomainError } from '../../../domain/domain-error.js';

const UNKNOWN_PROPERTY_CONSTRAINT = 'whitelistValidation';

function describeConstraints(error: ValidationError): string[] {
  return Object.entries(error.constraints ?? {}).map(([constraint, message]) =>
    constraint === UNKNOWN_PROPERTY_CONSTRAINT
      ? `El campo ${error.property} no está permitido`
      : message,
  );
}

function collectMessages(errors: readonly ValidationError[]): string[] {
  return errors.flatMap((error) => [
    ...describeConstraints(error),
    ...collectMessages(error.children ?? []),
  ]);
}

export class RequestValidationError extends DomainError {
  readonly code = 'VALIDATION_ERROR';
  readonly kind = 'validation';

  constructor(errors: readonly ValidationError[]) {
    super(collectMessages(errors).join('; '));
  }
}
