import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiServiceUnavailableResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { ErrorResponseDto } from '../../../../shared/infrastructure/http/errors/error-response.dto.js';
import { ExchangeRateDto } from './dto/exchange-rate.dto.js';

export function ApiCurrentExchangeRate(): MethodDecorator {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Devuelve el tipo de cambio vigente (USD/PEN)' }),
    ApiOkResponse({ type: ExchangeRateDto }),
    ApiUnauthorizedResponse({
      type: ErrorResponseDto,
      description: 'Token ausente, inválido o expirado',
    }),
    ApiServiceUnavailableResponse({
      type: ErrorResponseDto,
      description: 'Todavía no se obtuvo ningún tipo de cambio',
    }),
  );
}
