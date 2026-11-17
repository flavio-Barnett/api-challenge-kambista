import { User } from '../../domain/entities/user.entity.js';
import type { UserRepository } from '../../domain/repositories/user.repository.js';
import { Email } from '../../domain/value-objects/email.vo.js';
import type { PasswordHasher } from '../ports/password-hasher.port.js';
import type {
  AuthSession,
  SessionIssuerService,
} from '../services/session-issuer.service.js';

export interface RegisterUserCommand {
  readonly name: string;
  readonly email: string;
  readonly password: string;
}

export class RegisterUserUseCase {
  constructor(
    private readonly users: UserRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly sessions: SessionIssuerService,
  ) {}

  async execute(command: RegisterUserCommand): Promise<AuthSession> {
    const email = Email.create(command.email);
    const passwordHash = await this.passwordHasher.hash(command.password);
    const user = await this.users.create(
      User.prepareRegistration(command.name, email, passwordHash),
    );
    return this.sessions.start(user);
  }
}
