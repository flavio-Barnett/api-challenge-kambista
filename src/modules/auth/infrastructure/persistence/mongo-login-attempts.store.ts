import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model } from 'mongoose';

import { LoginAttemptsStore } from '../../application/ports/login-attempts-store.port.js';
import {
  LOGIN_ATTEMPT_MODEL,
  type LoginAttemptRecord,
} from './login-attempt.schema.js';

function countAttemptWithinWindow(now: Date, windowMs: number): object[] {
  const windowIsOpen = { $gt: ['$expiresAt', now] };
  return [
    {
      $set: {
        attempts: { $cond: [windowIsOpen, { $add: ['$attempts', 1] }, 1] },
        expiresAt: {
          $cond: [
            windowIsOpen,
            '$expiresAt',
            new Date(now.getTime() + windowMs),
          ],
        },
      },
    },
  ];
}

@Injectable()
export class MongoLoginAttemptsStore extends LoginAttemptsStore {
  constructor(
    @InjectModel(LOGIN_ATTEMPT_MODEL)
    private readonly attempts: Model<LoginAttemptRecord>,
  ) {
    super();
  }

  async registerAttempt(
    key: string,
    now: Date,
    windowMs: number,
  ): Promise<number> {
    const entry = await this.attempts
      .findOneAndUpdate({ key }, countAttemptWithinWindow(now, windowMs), {
        upsert: true,
        returnDocument: 'after',
        projection: { attempts: 1 },
        updatePipeline: true,
      })
      .lean<Pick<LoginAttemptRecord, 'attempts'>>()
      .exec();
    return entry?.attempts ?? 1;
  }

  async reset(key: string): Promise<void> {
    await this.attempts.deleteOne({ key }).exec();
  }
}
