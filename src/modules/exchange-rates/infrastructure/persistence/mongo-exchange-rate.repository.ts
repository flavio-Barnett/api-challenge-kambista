import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model } from 'mongoose';

import type {
  ExchangeRate,
  NewExchangeRate,
} from '../../domain/entities/exchange-rate.entity.js';
import { ExchangeRateRepository } from '../../domain/repositories/exchange-rate.repository.js';
import {
  toExchangeRate,
  toExchangeRateDocument,
} from './exchange-rate.mapper.js';
import {
  EXCHANGE_RATE_MODEL,
  type ExchangeRateRecord,
} from './exchange-rate.schema.js';

@Injectable()
export class MongoExchangeRateRepository extends ExchangeRateRepository {
  constructor(
    @InjectModel(EXCHANGE_RATE_MODEL)
    private readonly rates: Model<ExchangeRateRecord>,
  ) {
    super();
  }

  async findCurrent(): Promise<ExchangeRate | null> {
    const record = await this.rates
      .findOne()
      .sort({ validFrom: -1 })
      .lean<ExchangeRateRecord>()
      .exec();
    return record ? toExchangeRate(record) : null;
  }

  async save(rate: NewExchangeRate): Promise<ExchangeRate> {
    const created = await this.rates.create(toExchangeRateDocument(rate));
    return toExchangeRate(created.toObject());
  }

  async confirm(
    id: string,
    providerDate: string,
    checkedAt: Date,
  ): Promise<void> {
    await this.rates
      .updateOne(
        { _id: id },
        { $set: { providerDate, lastCheckedAt: checkedAt } },
      )
      .exec();
  }
}
