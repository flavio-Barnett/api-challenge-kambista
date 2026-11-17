import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
  Logger,
} from '@nestjs/common';
import type { Response } from 'express';
import type { ErrorResponse } from './error-response.js';
import { resolveError } from './resolve-error.js';

const SERVER_ERROR_STATUS_FLOOR = 500;

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    const { status, code, message } = resolveError(exception);
    if (status >= SERVER_ERROR_STATUS_FLOOR) {
      this.logServerError(exception);
    }
    const body: ErrorResponse = { success: false, error: { code, message } };
    response.status(status).json(body);
  }

  private logServerError(exception: unknown): void {
    const trace =
      exception instanceof Error ? exception.stack : String(exception);
    this.logger.error('Request failed with a server error', trace);
  }
}
