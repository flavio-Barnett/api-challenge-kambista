import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const MAX_LIMIT = 100;
const MAX_PAGE = 10_000;
const MAX_USER_ID_LENGTH = 64;

export class TransactionHistoryQueryDto {
  @Matches(DATE_PATTERN, {
    message: 'La fecha de inicio debe tener el formato YYYY-MM-DD',
  })
  @IsString({ message: 'La fecha de inicio es obligatoria' })
  startDate: string;

  @Matches(DATE_PATTERN, {
    message: 'La fecha de fin debe tener el formato YYYY-MM-DD',
  })
  @IsString({ message: 'La fecha de fin es obligatoria' })
  endDate: string;

  @MaxLength(MAX_USER_ID_LENGTH, { message: 'El userId no es válido' })
  @IsString({ message: 'El userId no es válido' })
  @IsOptional()
  userId?: string;

  @ApiPropertyOptional({
    type: Number,
    default: 1,
    minimum: 1,
    maximum: MAX_PAGE,
  })
  @Max(MAX_PAGE, { message: `La página no puede superar ${String(MAX_PAGE)}` })
  @Min(1, { message: 'La página debe ser mayor o igual a 1' })
  @IsInt({ message: 'La página debe ser un número entero' })
  @Type(() => Number)
  @IsOptional()
  page = 1;

  @ApiPropertyOptional({
    type: Number,
    default: 20,
    minimum: 1,
    maximum: MAX_LIMIT,
  })
  @Max(MAX_LIMIT, {
    message: `El límite no puede superar ${String(MAX_LIMIT)}`,
  })
  @Min(1, { message: 'El límite debe ser mayor o igual a 1' })
  @IsInt({ message: 'El límite debe ser un número entero' })
  @Type(() => Number)
  @IsOptional()
  limit = 20;
}
