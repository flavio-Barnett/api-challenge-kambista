import type { ValidationError } from 'class-validator';
import { DomainError } from '../../../domain/domain-error.js';

function collectMessages(errors: readonly ValidationError[]): string[] {
  return errors.flatMap((error) => [
    ...Object.values(error.constraints ?? {}),
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
