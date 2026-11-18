import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { GetCurrentExchangeRateUseCase } from '../../application/use-cases/get-current-exchange-rate.use-case.js';
import { ExchangeRateDto } from './dto/exchange-rate.dto.js';
import { ApiCurrentExchangeRate } from './exchange-rates.docs.js';

@ApiTags('exchange-rates')
@Controller('exchange-rates')
export class ExchangeRatesController {
  constructor(
    private readonly getCurrentExchangeRate: GetCurrentExchangeRateUseCase,
  ) {}

  @Get('current')
  @ApiCurrentExchangeRate()
  async current(): Promise<ExchangeRateDto> {
    return ExchangeRateDto.fromEntity(
      await this.getCurrentExchangeRate.execute(),
    );
  }
}
