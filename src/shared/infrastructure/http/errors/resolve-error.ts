import { HttpException, HttpStatus } from '@nestjs/common';
import {
  DomainError,
  type DomainErrorKind,
} from '../../../domain/domain-error.js';
import type { ResolvedError } from './error-response.js';

const STATUS_BY_KIND: Record<DomainErrorKind, HttpStatus> = {
  validation: HttpStatus.BAD_REQUEST,
  unauthorized: HttpStatus.UNAUTHORIZED,
  forbidden: HttpStatus.FORBIDDEN,
  not_found: HttpStatus.NOT_FOUND,
  conflict: HttpStatus.CONFLICT,
  too_many_requests: HttpStatus.TOO_MANY_REQUESTS,
  unavailable: HttpStatus.SERVICE_UNAVAILABLE,
};

const CODE_BY_STATUS: Partial<Record<number, string>> = {
  [HttpStatus.BAD_REQUEST]: 'VALIDATION_ERROR',
  [HttpStatus.UNAUTHORIZED]: 'UNAUTHORIZED',
  [HttpStatus.FORBIDDEN]: 'FORBIDDEN',
  [HttpStatus.NOT_FOUND]: 'NOT_FOUND',
  [HttpStatus.CONFLICT]: 'CONFLICT',
  [HttpStatus.PAYLOAD_TOO_LARGE]: 'PAYLOAD_TOO_LARGE',
  [HttpStatus.TOO_MANY_REQUESTS]: 'TOO_MANY_REQUESTS',
};

const INTERNAL_ERROR: ResolvedError = {
  status: HttpStatus.INTERNAL_SERVER_ERROR,
  code: 'INTERNAL_ERROR',
  message: 'An unexpected error occurred',
};

function fromDomainError(error: DomainError): ResolvedError {
  return {
    status: STATUS_BY_KIND[error.kind],
    code: error.code,
    message: error.message,
  };
}

function fromHttpException(exception: HttpException): ResolvedError {
  const status = exception.getStatus();
  return {
    status,
    code: CODE_BY_STATUS[status] ?? 'HTTP_ERROR',
    message: exception.message,
  };
}

export function resolveError(exception: unknown): ResolvedError {
  if (exception instanceof DomainError) {
    return fromDomainError(exception);
  }
  if (exception instanceof HttpException) {
    return fromHttpException(exception);
  }
  return INTERNAL_ERROR;
}
