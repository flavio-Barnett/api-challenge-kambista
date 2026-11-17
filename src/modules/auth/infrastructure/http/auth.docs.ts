import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOperation,
} from '@nestjs/swagger';

import { ErrorResponseDto } from '../../../../shared/infrastructure/http/errors/error-response.dto.js';
import { UsuarioDto } from './dto/usuario.dto.js';

export function ApiRegister(): MethodDecorator {
  return applyDecorators(
    ApiOperation({ summary: 'Registra un usuario con rol user' }),
    ApiCreatedResponse({ type: UsuarioDto }),
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
