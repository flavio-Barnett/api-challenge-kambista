import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNumber } from 'class-validator';

import {
  CURRENCIES,
  type Currency,
} from '../../../domain/types/currency.type.js';

const MAX_AMOUNT = 9_999_999.99;
const CURRENCY_MESSAGE = `debe ser una de: ${CURRENCIES.join(', ')}`;

export class CreateTransactionDto {
  @IsIn(CURRENCIES, { message: `La moneda de origen ${CURRENCY_MESSAGE}` })
  monedaOrigen: Currency;

  @IsIn(CURRENCIES, { message: `La moneda de destino ${CURRENCY_MESSAGE}` })
  monedaDestino: Currency;

  @ApiProperty({ example: 100, minimum: 0.01, maximum: MAX_AMOUNT })
  @IsNumber(
    { allowNaN: false, allowInfinity: false },
    { message: 'El monto debe ser un número' },
  )
  monto: number;
}
