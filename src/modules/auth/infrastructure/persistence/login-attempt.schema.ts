import { Schema } from 'mongoose';

export const LOGIN_ATTEMPT_MODEL = 'LoginAttempt';

export interface LoginAttemptRecord {
  readonly key: string;
  readonly attempts: number;
  readonly expiresAt: Date;
}

export const loginAttemptSchema = new Schema<LoginAttemptRecord>(
  {
    key: { type: String, required: true, unique: true },
    attempts: { type: Number, required: true },
    expiresAt: { type: Date, required: true, expires: 0 },
  },
  { collection: 'login_attempts', versionKey: false },
);
