import { User } from '../../domain/entities/user.entity.js';
import { Email } from '../../domain/value-objects/email.vo.js';
import { createAuthTestKit } from '../../testing/auth-test-kit.js';
import {
  InvalidCredentialsError,
  TooManyLoginAttemptsError,
} from '../auth.errors.js';
import { LOGIN_ATTEMPTS_POLICY } from '../login-attempts.policy.js';
import { LogInUseCase } from './log-in.use-case.js';

const valid = {
  email: 'ana@kambista.com',
  password: 'secret-password',
  ipAddress: '203.0.113.10',
};
const wrong = { ...valid, password: 'wrong-password' };

describe('LogInUseCase', () => {
  let kit: ReturnType<typeof createAuthTestKit>;
  let logIn: LogInUseCase;

  async function failTimes(times: number): Promise<void> {
    for (let attempt = 0; attempt < times; attempt += 1) {
      await expect(logIn.execute(wrong)).rejects.toBeInstanceOf(
        InvalidCredentialsError,
      );
    }
  }

  beforeEach(async () => {
    kit = createAuthTestKit();
    logIn = new LogInUseCase(
      kit.users,
      kit.passwordHasher,
      kit.sessions,
      kit.loginAttempts,
      kit.clock,
    );
    await kit.users.create(
      User.prepareRegistration(
        'Ana Pérez',
        Email.create(valid.email),
        await kit.passwordHasher.hash(valid.password),
      ),
    );
  });

  it('starts a session for valid credentials', async () => {
    const session = await logIn.execute({
      ...valid,
      email: 'ANA@kambista.com',
    });

    expect(session.user.email.value).toBe(valid.email);
    expect(session.accessToken).toBe(`access-token:${session.user.id}`);
  });

  it('rejects a wrong password', async () => {
    await failTimes(1);
  });

  it('rejects an unknown email after simulating the password check', async () => {
    const simulateMatch = vi.spyOn(kit.passwordHasher, 'simulateMatch');

    await expect(
      logIn.execute({ ...wrong, email: 'nadie@kambista.com' }),
    ).rejects.toBeInstanceOf(InvalidCredentialsError);
    expect(simulateMatch).toHaveBeenCalledWith(wrong.password);
  });

  it('locks the email and ip pair after too many failures', async () => {
    await failTimes(LOGIN_ATTEMPTS_POLICY.maxAttempts);

    await expect(logIn.execute(valid)).rejects.toBeInstanceOf(
      TooManyLoginAttemptsError,
    );
  });

  it('keeps other ip addresses unlocked', async () => {
    await failTimes(LOGIN_ATTEMPTS_POLICY.maxAttempts);

    await expect(
      logIn.execute({ ...valid, ipAddress: '198.51.100.7' }),
    ).resolves.toBeDefined();
  });

  it('unlocks once the window expires', async () => {
    await failTimes(LOGIN_ATTEMPTS_POLICY.maxAttempts);
    kit.clock.advanceBy(LOGIN_ATTEMPTS_POLICY.windowMs);

    await expect(logIn.execute(valid)).resolves.toBeDefined();
  });

  it('resets the failure count after a successful login', async () => {
    await failTimes(LOGIN_ATTEMPTS_POLICY.maxAttempts - 1);
    await logIn.execute(valid);
    await failTimes(LOGIN_ATTEMPTS_POLICY.maxAttempts - 1);

    await expect(logIn.execute(valid)).resolves.toBeDefined();
  });

  it('never verifies more passwords than allowed in a concurrent burst', async () => {
    const matches = vi.spyOn(kit.passwordHasher, 'matches');

    const results = await Promise.allSettled(
      Array.from({ length: 10 }, () => logIn.execute(wrong)),
    );

    const rejectedWith = (errorType: new () => Error): number =>
      results.filter(
        (result) =>
          result.status === 'rejected' && result.reason instanceof errorType,
      ).length;
    expect(rejectedWith(InvalidCredentialsError)).toBe(
      LOGIN_ATTEMPTS_POLICY.maxAttempts,
    );
    expect(rejectedWith(TooManyLoginAttemptsError)).toBe(
      10 - LOGIN_ATTEMPTS_POLICY.maxAttempts,
    );
    expect(matches).toHaveBeenCalledTimes(LOGIN_ATTEMPTS_POLICY.maxAttempts);
    await expect(logIn.execute(valid)).rejects.toBeInstanceOf(
      TooManyLoginAttemptsError,
    );
  });
});
