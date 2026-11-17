import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { type Model, Types } from 'mongoose';

import {
  RefreshTokenStore,
  type StoredRefreshToken,
} from '../../application/ports/refresh-token-store.port.js';
import {
  REFRESH_TOKEN_MODEL,
  type RefreshTokenRecord,
} from './refresh-token.schema.js';

@Injectable()
export class MongoRefreshTokenStore extends RefreshTokenStore {
  constructor(
    @InjectModel(REFRESH_TOKEN_MODEL)
    private readonly tokens: Model<RefreshTokenRecord>,
  ) {
    super();
  }

  async save(token: StoredRefreshToken): Promise<void> {
    await this.tokens.create({
      tokenHash: token.tokenHash,
      userId: new Types.ObjectId(token.userId),
      expiresAt: token.expiresAt,
    });
  }

  async consume(tokenHash: string, now: Date): Promise<string | null> {
    const consumed = await this.tokens
      .findOneAndUpdate(
        { tokenHash, revokedAt: null, expiresAt: { $gt: now } },
        { $set: { revokedAt: now } },
        { projection: { userId: 1 } },
      )
      .lean<Pick<RefreshTokenRecord, 'userId'>>()
      .exec();
    return consumed?.userId.toHexString() ?? null;
  }

  async findRevokedOwner(tokenHash: string): Promise<string | null> {
    const revoked = await this.tokens
      .findOne({ tokenHash, revokedAt: { $ne: null } }, { userId: 1 })
      .lean<Pick<RefreshTokenRecord, 'userId'>>()
      .exec();
    return revoked?.userId.toHexString() ?? null;
  }

  async revokeAllForUser(userId: string, now: Date): Promise<void> {
    await this.tokens
      .updateMany(
        { userId: new Types.ObjectId(userId), revokedAt: null },
        { $set: { revokedAt: now } },
      )
      .exec();
  }
}
