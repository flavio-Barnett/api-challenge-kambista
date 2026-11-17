import { User } from '../../domain/entities/user.entity.js';
import type { UserRepository } from '../../domain/repositories/user.repository.js';
import { Email } from '../../domain/value-objects/email.vo.js';
import type { PasswordHasher } from '../ports/password-hasher.port.js';

export interface RegisterUserCommand {
  readonly name: string;
  readonly email: string;
  readonly password: string;
}

export class RegisterUserUseCase {
  constructor(
    private readonly users: UserRepository,
    private readonly passwordHasher: PasswordHasher,
  ) {}

  async execute(command: RegisterUserCommand): Promise<User> {
    const email = Email.create(command.email);
    const passwordHash = await this.passwordHasher.hash(command.password);
    return this.users.create(
      User.prepareRegistration(command.name, email, passwordHash),
    );
  }
}
