import { type NewUser, User } from '../../domain/entities/user.entity.js';
import { Email } from '../../domain/value-objects/email.vo.js';
import type { UserRecord } from './user.schema.js';

export function toUser(record: UserRecord): User {
  return User.restore({
    id: record._id.toHexString(),
    name: record.name,
    email: Email.create(record.email),
    passwordHash: record.passwordHash,
    role: record.role,
  });
}

export function toUserDocument(user: NewUser): Omit<UserRecord, '_id'> {
  return {
    name: user.name,
    email: user.email.value,
    passwordHash: user.passwordHash,
    role: user.role,
  };
}
