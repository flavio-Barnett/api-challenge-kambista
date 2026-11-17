import { HttpException, HttpStatus } from '@nestjs/common';

import {
  DomainError,
  type DomainErrorKind,
} from '../../../domain/domain-error.js';
import type { ErrorBody, ResolvedError } from './error-response.type.js';

const STATUS_BY_KIND: Record<DomainErrorKind, HttpStatus> = {
  validation: HttpStatus.BAD_REQUEST,
  unauthorized: HttpStatus.UNAUTHORIZED,
  forbidden: HttpStatus.FORBIDDEN,
  not_found: HttpStatus.NOT_FOUND,
  conflict: HttpStatus.CONFLICT,
  too_many_requests: HttpStatus.TOO_MANY_REQUESTS,
  unavailable: HttpStatus.SERVICE_UNAVAILABLE,
};

const HTTP_ERRORS: Partial<Record<number, ErrorBody>> = {
  [HttpStatus.BAD_REQUEST]: {
    code: 'VALIDATION_ERROR',
    message: 'La solicitud no es válida',
  },
  [HttpStatus.UNAUTHORIZED]: {
    code: 'UNAUTHORIZED',
    message: 'Se requiere autenticación',
  },
  [HttpStatus.FORBIDDEN]: {
    code: 'FORBIDDEN',
    message: 'No tienes permisos para realizar esta acción',
  },
  [HttpStatus.NOT_FOUND]: {
    code: 'NOT_FOUND',
    message: 'El recurso solicitado no existe',
  },
  [HttpStatus.CONFLICT]: {
    code: 'CONFLICT',
    message: 'La solicitud entra en conflicto con el estado actual',
  },
  [HttpStatus.PAYLOAD_TOO_LARGE]: {
    code: 'PAYLOAD_TOO_LARGE',
    message: 'El cuerpo de la solicitud es demasiado grande',
  },
  [HttpStatus.TOO_MANY_REQUESTS]: {
    code: 'TOO_MANY_REQUESTS',
    message: 'Demasiadas solicitudes, intenta nuevamente más tarde',
  },
  [HttpStatus.SERVICE_UNAVAILABLE]: {
    code: 'SERVICE_UNAVAILABLE',
    message: 'El servicio no está disponible temporalmente',
  },
};

const UNKNOWN_HTTP_ERROR: ErrorBody = {
  code: 'HTTP_ERROR',
  message: 'No se pudo procesar la solicitud',
};

const INTERNAL_ERROR: ResolvedError = {
  status: HttpStatus.INTERNAL_SERVER_ERROR,
  code: 'INTERNAL_ERROR',
  message: 'Ocurrió un error inesperado',
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
  return { status, ...(HTTP_ERRORS[status] ?? UNKNOWN_HTTP_ERROR) };
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
