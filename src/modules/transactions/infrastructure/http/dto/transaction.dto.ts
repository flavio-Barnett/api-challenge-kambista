import { ApiProperty } from '@nestjs/swagger';

import type { Transaction } from '../../../domain/entities/transaction.entity.js';
import {
  CURRENCIES,
  type Currency,
} from '../../../domain/types/currency.type.js';

export class TransactionDto {
  id: string;

  @ApiProperty({ enum: CURRENCIES, example: 'USD' })
  monedaOrigen: Currency;

  @ApiProperty({ enum: CURRENCIES, example: 'PEN' })
  monedaDestino: Currency;

  @ApiProperty({ example: 100 })
  monto: number;

  @ApiProperty({ example: 373.9 })
  montoCambiado: number;

  @ApiProperty({ example: 3.739 })
  tipoCambio: number;

  @ApiProperty({ example: '2026-11-18T15:30:00.000Z' })
  fecha: string;

  static fromEntity(transaction: Transaction): TransactionDto {
    return {
      id: transaction.id,
      monedaOrigen: transaction.from,
      monedaDestino: transaction.to,
      monto: transaction.amount.value.toNumber(),
      montoCambiado: transaction.convertedAmount.toNumber(),
      tipoCambio: transaction.appliedRate.toNumber(),
      fecha: transaction.createdAt.toISOString(),
    };
  }
}
