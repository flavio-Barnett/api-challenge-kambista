import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { ErrorResponseDto } from '../../../../shared/infrastructure/http/errors/error-response.dto.js';
import { AuthResponseDto } from './dto/auth-response.dto.js';
import { UsuarioDto } from './dto/usuario.dto.js';

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

export function ApiCurrentUser(): MethodDecorator {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Devuelve el usuario autenticado' }),
    ApiOkResponse({ type: UsuarioDto }),
    ApiUnauthorizedResponse({
      type: ErrorResponseDto,
      description:
        'Token ausente, inválido o expirado, o sesión que ya no es válida',
    }),
  );
}

export function ApiRefreshSession(): MethodDecorator {
  return applyDecorators(
    ApiOperation({
      summary: 'Renueva la sesión y rota el refresh token',
    }),
    ApiOkResponse({ type: AuthResponseDto }),
    ApiUnauthorizedResponse({
      type: ErrorResponseDto,
      description: 'Refresh token inválido, expirado o reutilizado',
    }),
  );
}

export function ApiLogOut(): MethodDecorator {
  return applyDecorators(
    ApiOperation({ summary: 'Cierra la sesión revocando el refresh token' }),
    ApiNoContentResponse({ description: 'Sesión cerrada' }),
  );
}
