import { Schema, type Types } from 'mongoose';

export const REFRESH_TOKEN_MODEL = 'RefreshToken';

export interface RefreshTokenRecord {
  readonly tokenHash: string;
  readonly userId: Types.ObjectId;
  readonly expiresAt: Date;
  readonly revokedAt: Date | null;
}

export const refreshTokenSchema = new Schema<RefreshTokenRecord>(
  {
    tokenHash: { type: String, required: true, unique: true },
    userId: { type: Schema.Types.ObjectId, required: true, index: true },
    expiresAt: { type: Date, required: true, expires: 0 },
    revokedAt: { type: Date, default: null },
  },
  {
    collection: 'refresh_tokens',
    timestamps: { createdAt: true, updatedAt: false },
    versionKey: false,
  },
);
