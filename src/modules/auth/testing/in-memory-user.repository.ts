import { EmailAlreadyRegisteredError } from '../domain/auth.errors.js';
import { type NewUser, User } from '../domain/entities/user.entity.js';
import { UserRepository } from '../domain/repositories/user.repository.js';
import type { Email } from '../domain/value-objects/email.vo.js';
import type { Role } from '../domain/value-objects/role.vo.js';

export class InMemoryUserRepository extends UserRepository {
  private users: User[] = [];

  create(newUser: NewUser): Promise<User> {
    if (this.users.some((user) => user.email.equals(newUser.email))) {
      return Promise.reject(new EmailAlreadyRegisteredError());
    }
    const user = User.restore({
      id: String(this.users.length + 1),
      ...newUser,
    });
    this.users.push(user);
    return Promise.resolve(user);
  }

  findByEmail(email: Email): Promise<User | null> {
    return Promise.resolve(
      this.users.find((user) => user.email.equals(email)) ?? null,
    );
  }

  findById(id: string): Promise<User | null> {
    return Promise.resolve(this.users.find((user) => user.id === id) ?? null);
  }

  changeRole(id: string, role: Role): Promise<void> {
    this.users = this.users.map((user) =>
      user.id === id
        ? User.restore({
            id: user.id,
            name: user.name,
            email: user.email,
            passwordHash: user.passwordHash,
            role,
          })
        : user,
    );
    return Promise.resolve();
  }
}
