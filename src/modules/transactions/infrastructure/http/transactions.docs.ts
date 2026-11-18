import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiServiceUnavailableResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { ErrorResponseDto } from '../../../../shared/infrastructure/http/errors/error-response.dto.js';
import { TransactionDto } from './dto/transaction.dto.js';

export const TOTAL_COUNT_HEADER = 'X-Total-Count';

const unauthorized = ApiUnauthorizedResponse({
  type: ErrorResponseDto,
  description: 'Token ausente, inválido o expirado',
});

export function ApiCreateTransaction(): MethodDecorator {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Registra un cambio de divisas con el tipo de cambio vigente',
    }),
    ApiCreatedResponse({ type: TransactionDto }),
    ApiBadRequestResponse({
      type: ErrorResponseDto,
      description:
        'Monto que no es número o moneda no soportada (VALIDATION_ERROR), monto fuera de rango (INVALID_AMOUNT) o monedas iguales (SAME_CURRENCY)',
    }),
    unauthorized,
    ApiServiceUnavailableResponse({
      type: ErrorResponseDto,
      description: 'No hay un tipo de cambio registrado',
    }),
  );
}

export function ApiTransactionHistory(): MethodDecorator {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Devuelve el historial de transacciones en un rango de fechas',
      description:
        'Las fechas se interpretan en hora de Lima (UTC-5) e incluyen ambos días completos. El parámetro userId solo aplica para administradores; un usuario siempre ve su propio historial.',
    }),
    ApiOkResponse({
      type: TransactionDto,
      isArray: true,
      headers: {
        [TOTAL_COUNT_HEADER]: {
          description: 'Total de transacciones en el rango, sin paginar',
          schema: { type: 'integer' },
        },
      },
    }),
    ApiBadRequestResponse({
      type: ErrorResponseDto,
      description:
        'Parámetros inválidos o rango de fechas inválido (INVALID_DATE_RANGE)',
    }),
    unauthorized,
    ApiNotFoundResponse({
      type: ErrorResponseDto,
      description: 'El usuario indicado en userId no existe',
    }),
  );
}
