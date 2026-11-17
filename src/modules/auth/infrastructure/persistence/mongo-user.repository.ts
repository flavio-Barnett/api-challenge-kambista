import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, type Model, mongo } from 'mongoose';

import { EmailAlreadyRegisteredError } from '../../domain/auth.errors.js';
import { type NewUser, User } from '../../domain/entities/user.entity.js';
import { UserRepository } from '../../domain/repositories/user.repository.js';
import { Email } from '../../domain/value-objects/email.vo.js';
import type { Role } from '../../domain/value-objects/role.vo.js';
import { USER_MODEL, type UserRecord } from './user.schema.js';

const DUPLICATE_KEY_ERROR_CODE = 11000;

function isDuplicateKeyError(error: unknown): boolean {
  return (
    error instanceof mongo.MongoServerError &&
    error.code === DUPLICATE_KEY_ERROR_CODE
  );
}

function toDomain(record: UserRecord): User {
  return User.restore({
    id: record._id.toHexString(),
    name: record.name,
    email: Email.create(record.email),
    passwordHash: record.passwordHash,
    role: record.role,
  });
}

@Injectable()
export class MongoUserRepository extends UserRepository {
  constructor(
    @InjectModel(USER_MODEL) private readonly users: Model<UserRecord>,
  ) {
    super();
  }

  async create(user: NewUser): Promise<User> {
    try {
      const created = await this.users.create({
        name: user.name,
        email: user.email.value,
        passwordHash: user.passwordHash,
        role: user.role,
      });
      return toDomain(created.toObject());
    } catch (error) {
      if (isDuplicateKeyError(error)) {
        throw new EmailAlreadyRegisteredError();
      }
      throw error;
    }
  }

  async findByEmail(email: Email): Promise<User | null> {
    const record = await this.users
      .findOne({ email: email.value })
      .select('+passwordHash')
      .lean<UserRecord>()
      .exec();
    return record ? toDomain(record) : null;
  }

  async findById(id: string): Promise<User | null> {
    if (!isValidObjectId(id)) {
      return null;
    }
    const record = await this.users.findById(id).lean<UserRecord>().exec();
    return record ? toDomain(record) : null;
  }

  async changeRole(id: string, role: Role): Promise<void> {
    await this.users.updateOne({ _id: id }, { $set: { role } }).exec();
  }
}
