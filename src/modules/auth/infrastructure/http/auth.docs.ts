import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { ErrorResponseDto } from '../../../../shared/infrastructure/http/errors/error-response.dto.js';
import { AuthResponseDto } from './dto/auth-response.dto.js';

export function ApiRegister(): MethodDecorator {
  return applyDecorators(
    ApiOperation({
      summary: 'Registra un usuario con rol user e inicia su sesión',
    }),
    ApiCreatedResponse({ type: AuthResponseDto }),
    ApiBadRequestResponse({
      type: ErrorResponseDto,
      description: 'Datos inválidos',
    }),
    ApiConflictResponse({
      type: ErrorResponseDto,
      description: 'El email ya está registrado',
    }),
  );
}

export function ApiLogIn(): MethodDecorator {
  return applyDecorators(
    ApiOperation({ summary: 'Inicia sesión con email y contraseña' }),
    ApiOkResponse({ type: AuthResponseDto }),
    ApiBadRequestResponse({
      type: ErrorResponseDto,
      description: 'Datos inválidos',
    }),
    ApiUnauthorizedResponse({
      type: ErrorResponseDto,
      description: 'Email o contraseña incorrectos',
    }),
  );
}
