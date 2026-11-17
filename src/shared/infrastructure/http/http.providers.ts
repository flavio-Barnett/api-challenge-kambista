import { type Provider, ValidationPipe } from '@nestjs/common';
import { APP_FILTER, APP_PIPE } from '@nestjs/core';

import { GlobalExceptionFilter } from './errors/global-exception.filter.js';
import { RequestValidationError } from './errors/request-validation.error.js';

export const httpProviders: Provider[] = [
  { provide: APP_FILTER, useClass: GlobalExceptionFilter },
  {
    provide: APP_PIPE,
    useValue: new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (errors) => new RequestValidationError(errors),
    }),
  },
];
