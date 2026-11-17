import type { Clock } from '../../../../shared/domain/clock.port.js';
import type { User } from '../../domain/entities/user.entity.js';
import type { UserRepository } from '../../domain/repositories/user.repository.js';
import { Email } from '../../domain/value-objects/email.vo.js';
import {
  InvalidCredentialsError,
  TooManyLoginAttemptsError,
} from '../auth.errors.js';
import { LOGIN_ATTEMPTS_POLICY } from '../login-attempts.policy.js';
import type { LoginAttemptsStore } from '../ports/login-attempts-store.port.js';
import type { PasswordHasher } from '../ports/password-hasher.port.js';
import type {
  AuthSession,
  SessionIssuerService,
} from '../services/session-issuer.service.js';

export interface LogInCommand {
  readonly email: string;
  readonly password: string;
  readonly ipAddress: string;
}

export class LogInUseCase {
  constructor(
    private readonly users: UserRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly sessions: SessionIssuerService,
    private readonly loginAttempts: LoginAttemptsStore,
    private readonly clock: Clock,
  ) {}

  async execute(command: LogInCommand): Promise<AuthSession> {
    const email = Email.create(command.email);
    const attemptsKey = `${email.value}|${command.ipAddress}`;
    await this.registerAttempt(attemptsKey);
    const user = await this.authenticate(email, command.password);
    if (!user) {
      throw new InvalidCredentialsError();
    }
    await this.loginAttempts.reset(attemptsKey);
    return this.sessions.start(user);
  }

  private async registerAttempt(attemptsKey: string): Promise<void> {
    const attempts = await this.loginAttempts.registerAttempt(
      attemptsKey,
      this.clock.now(),
      LOGIN_ATTEMPTS_POLICY.windowMs,
    );
    if (attempts > LOGIN_ATTEMPTS_POLICY.maxAttempts) {
      throw new TooManyLoginAttemptsError();
    }
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
