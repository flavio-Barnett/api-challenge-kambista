import type { UserRepository } from '../../domain/repositories/user.repository.js';

export class CheckUserExistsUseCase {
  constructor(private readonly users: UserRepository) {}

  async execute(userId: string): Promise<boolean> {
    return (await this.users.findById(userId)) !== null;
  }
}
