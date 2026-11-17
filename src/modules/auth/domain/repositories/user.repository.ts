import type { NewUser, User } from '../entities/user.entity.js';
import type { Email } from '../value-objects/email.vo.js';
import type { Role } from '../value-objects/role.vo.js';

export abstract class UserRepository {
  abstract create(user: NewUser): Promise<User>;
  abstract findByEmail(email: Email): Promise<User | null>;
  abstract findById(id: string): Promise<User | null>;
  abstract changeRole(id: string, role: Role): Promise<void>;
}
