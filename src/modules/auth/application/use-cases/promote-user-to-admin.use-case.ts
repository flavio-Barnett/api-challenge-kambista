import { UserNotFoundError } from '../../domain/auth.errors.js';
import type { User } from '../../domain/entities/user.entity.js';
import type { UserRepository } from '../../domain/repositories/user.repository.js';
import { Email } from '../../domain/value-objects/email.vo.js';

export class PromoteUserToAdminUseCase {
  constructor(private readonly users: UserRepository) {}

  async execute(rawEmail: string): Promise<User> {
    const user = await this.users.findByEmail(Email.create(rawEmail));
    if (!user) {
      throw new UserNotFoundError();
    }
    if (user.isAdmin()) {
      return user;
    }
    const promoted = user.promoteToAdmin();
    await this.users.changeRole(promoted.id, promoted.role);
    return promoted;
  }
}
