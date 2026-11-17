import {
  type ArgumentsHost,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';

import { DomainError } from '../../../domain/domain-error.js';
import { GlobalExceptionFilter } from './global-exception.filter.js';
import { RequestValidationError } from './request-validation.error.js';

class InsufficientFundsError extends DomainError {
  readonly code = 'INSUFFICIENT_FUNDS';
  readonly kind = 'conflict';

  constructor() {
    super('The account has insufficient funds');
  }
}

class RateUnavailableError extends DomainError {
  readonly code = 'EXCHANGE_RATE_UNAVAILABLE';
  readonly kind = 'unavailable';

  constructor() {
    super('Exchange rate is not available');
  }
}

function createHost(): {
  host: ArgumentsHost;
  status: ReturnType<typeof vi.fn>;
  json: ReturnType<typeof vi.fn>;
} {
  const json = vi.fn();
  const status = vi.fn().mockReturnValue({ json });
  const host = {
    switchToHttp: () => ({ getResponse: () => ({ status }) }),
  } as unknown as ArgumentsHost;
  return { host, status, json };
}

describe('GlobalExceptionFilter', () => {
  const filter = new GlobalExceptionFilter();
  let logError: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    logError = vi
      .spyOn(Logger.prototype, 'error')
      .mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('maps a client domain error by kind without logging it', () => {
    const { host, status, json } = createHost();

    filter.catch(new InsufficientFundsError(), host);

    expect(status).toHaveBeenCalledWith(409);
    expect(json).toHaveBeenCalledWith({
      success: false,
      error: {
        code: 'INSUFFICIENT_FUNDS',
        message: 'The account has insufficient funds',
      },
    });
    expect(logError).not.toHaveBeenCalled();
  });

  it('logs domain errors that map to a server status', () => {
    const { host, status } = createHost();
    const error = new RateUnavailableError();

    filter.catch(error, host);

    expect(status).toHaveBeenCalledWith(503);
    expect(logError).toHaveBeenCalledWith(
      'Request failed with a server error',
      error.stack,
    );
  });

  it('maps request validation errors to VALIDATION_ERROR', () => {
    const { host, status, json } = createHost();
    const error = new RequestValidationError([
      {
        property: 'monto',
        constraints: { isPositive: 'monto must be a positive number' },
        children: [],
      },
    ]);

    filter.catch(error, host);

    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'monto must be a positive number',
      },
    });
  });

  it.each([
    [
      new NotFoundException('Cannot GET /missing'),
      404,
      'NOT_FOUND',
      'El recurso solicitado no existe',
    ],
    [
      new ServiceUnavailableException('Service Unavailable Exception'),
      503,
      'SERVICE_UNAVAILABLE',
      'El servicio no está disponible temporalmente',
    ],
  ])(
    'maps framework http exceptions by status',
    (exception, expectedStatus, expectedCode, expectedMessage) => {
      const { host, status, json } = createHost();

      filter.catch(exception, host);

      expect(status).toHaveBeenCalledWith(expectedStatus);
      expect(json).toHaveBeenCalledWith({
        success: false,
        error: { code: expectedCode, message: expectedMessage },
      });
    },
  );

  it('hides unknown errors behind INTERNAL_ERROR and logs them', () => {
    const { host, status, json } = createHost();
    const failure = new Error('connection string leaked');

    filter.catch(failure, host);

    expect(status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Ocurrió un error inesperado',
      },
    });
    expect(logError).toHaveBeenCalledWith(
      'Request failed with a server error',
      failure.stack,
    );
  });

  it('logs thrown values that are not errors', () => {
    const { host, status } = createHost();

    filter.catch('unexpected', host);

    expect(status).toHaveBeenCalledWith(500);
    expect(logError).toHaveBeenCalledWith(
      'Request failed with a server error',
      'unexpected',
    );
  });
});
