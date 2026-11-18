import { Body, Controller, Get, Post, Query, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';

import type { AuthenticatedUser } from '../../../../shared/infrastructure/http/authenticated-user.type.js';
import { CurrentUser } from '../../../../shared/infrastructure/http/current-user.decorator.js';
import { CreateTransactionUseCase } from '../../application/use-cases/create-transaction.use-case.js';
import { GetTransactionHistoryUseCase } from '../../application/use-cases/get-transaction-history.use-case.js';
import { CreateTransactionDto } from './dto/create-transaction.dto.js';
import { TransactionDto } from './dto/transaction.dto.js';
import { TransactionHistoryQueryDto } from './dto/transaction-history-query.dto.js';
import {
  ApiCreateTransaction,
  ApiTransactionHistory,
  TOTAL_COUNT_HEADER,
} from './transactions.docs.js';

@ApiTags('transactions')
@Controller('transactions')
export class TransactionsController {
  constructor(
    private readonly createTransaction: CreateTransactionUseCase,
    private readonly getTransactionHistory: GetTransactionHistoryUseCase,
  ) {}

  @Post()
  @ApiCreateTransaction()
  async create(
    @CurrentUser() current: AuthenticatedUser,
    @Body() dto: CreateTransactionDto,
  ): Promise<TransactionDto> {
    const transaction = await this.createTransaction.execute({
      userId: current.id,
      from: dto.monedaOrigen,
      to: dto.monedaDestino,
      amount: dto.monto,
    });
    return TransactionDto.fromEntity(transaction);
  }

  @Get('history')
  @ApiTransactionHistory()
  async history(
    @CurrentUser() current: AuthenticatedUser,
    @Query() query: TransactionHistoryQueryDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<TransactionDto[]> {
    const { items, total } = await this.getTransactionHistory.execute({
      requester: { id: current.id, isAdmin: current.role === 'admin' },
      startDate: query.startDate,
      endDate: query.endDate,
      userId: query.userId,
      page: query.page,
      limit: query.limit,
    });
    response.setHeader(TOTAL_COUNT_HEADER, String(total));
    return items.map((transaction) => TransactionDto.fromEntity(transaction));
  }
}
