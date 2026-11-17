import { Schema, type Types } from 'mongoose';

import {
  DEFAULT_ROLE,
  type Role,
  ROLES,
} from '../../domain/value-objects/role.vo.js';

export const USER_MODEL = 'User';

export interface UserRecord {
  readonly _id: Types.ObjectId;
  readonly name: string;
  readonly email: string;
  readonly passwordHash: string;
  readonly role: Role;
}

export const userSchema = new Schema<UserRecord>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ROLES, default: DEFAULT_ROLE, required: true },
  },
  { collection: 'users', timestamps: true, versionKey: false },
);
