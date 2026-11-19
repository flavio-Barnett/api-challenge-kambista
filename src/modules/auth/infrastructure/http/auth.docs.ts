import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTooManyRequestsResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { ErrorResponseDto } from '../../../../shared/infrastructure/http/errors/error-response.dto.js';
import { AccessTokenDto } from './dto/access-token.dto.js';
import { AuthResponseDto } from './dto/auth-response.dto.js';
import { UsuarioDto } from './dto/usuario.dto.js';
import {
  REFRESH_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE_PATH,
} from './refresh-token.cookie.js';

const SESSION_COOKIE_HEADER = {
  'Set-Cookie': {
    description: `Cookie ${REFRESH_TOKEN_COOKIE} HttpOnly, SameSite=Strict y Path=${REFRESH_TOKEN_COOKIE_PATH} con el refresh token`,
    schema: { type: 'string' },
  },
};

const forbiddenOrigin = ApiForbiddenResponse({
  type: ErrorResponseDto,
  description: 'El header Origin no es un origen permitido',
});

export function ApiRegister(): MethodDecorator {
  return applyDecorators(
    ApiOperation({
      summary: 'Registra un usuario con rol user e inicia su sesión',
    }),
    ApiCreatedResponse({
      type: AuthResponseDto,
      headers: SESSION_COOKIE_HEADER,
    }),
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
    ApiOkResponse({ type: AuthResponseDto, headers: SESSION_COOKIE_HEADER }),
    ApiBadRequestResponse({
      type: ErrorResponseDto,
      description: 'Datos inválidos',
    }),
    ApiUnauthorizedResponse({
      type: ErrorResponseDto,
      description: 'Email o contraseña incorrectos',
    }),
    ApiTooManyRequestsResponse({
      type: ErrorResponseDto,
      description: 'Demasiados intentos fallidos para ese email desde esa IP',
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
    ApiCookieAuth(REFRESH_TOKEN_COOKIE),
    ApiOperation({
      summary: 'Renueva la sesión y rota el refresh token',
      description:
        'Lee el refresh token de la cookie y responde un access token nuevo junto con una cookie rotada.',
    }),
    ApiOkResponse({ type: AccessTokenDto, headers: SESSION_COOKIE_HEADER }),
    ApiUnauthorizedResponse({
      type: ErrorResponseDto,
      description:
        'Cookie ausente, o refresh token inválido, expirado o reutilizado',
    }),
    forbiddenOrigin,
  );
}

export function ApiLogOut(): MethodDecorator {
  return applyDecorators(
    ApiCookieAuth(REFRESH_TOKEN_COOKIE),
    ApiOperation({
      summary: 'Cierra la sesión revocando el refresh token',
      description:
        'Revoca el refresh token de la cookie, si existe, y la elimina. Es idempotente.',
    }),
    ApiNoContentResponse({ description: 'Sesión cerrada' }),
    forbiddenOrigin,
  );
}
