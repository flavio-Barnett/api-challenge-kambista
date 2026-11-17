import type { User } from '../../domain/entities/user.entity.js';
import type { UserRepository } from '../../domain/repositories/user.repository.js';
import { Email } from '../../domain/value-objects/email.vo.js';
import { InvalidCredentialsError } from '../auth.errors.js';
import type { PasswordHasher } from '../ports/password-hasher.port.js';
import type {
  AuthSession,
  SessionIssuerService,
} from '../services/session-issuer.service.js';

export interface LogInCommand {
  readonly email: string;
  readonly password: string;
}

export class LogInUseCase {
  constructor(
    private readonly users: UserRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly sessions: SessionIssuerService,
  ) {}

  async execute(command: LogInCommand): Promise<AuthSession> {
    const user = await this.authenticate(
      Email.create(command.email),
      command.password,
    );
    if (!user) {
      throw new InvalidCredentialsError();
    }
    return this.sessions.start(user);
  }

  private async authenticate(
    email: Email,
    password: string,
  ): Promise<User | null> {
    const user = await this.users.findByEmail(email);
    if (!user) {
      await this.passwordHasher.simulateMatch(password);
      return null;
    }
    const matches = await this.passwordHasher.matches(
      password,
      user.passwordHash,
    );
    return matches ? user : null;
  }
}
