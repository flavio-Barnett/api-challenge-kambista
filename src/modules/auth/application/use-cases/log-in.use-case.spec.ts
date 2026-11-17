import { User } from '../../domain/entities/user.entity.js';
import { Email } from '../../domain/value-objects/email.vo.js';
import { createAuthTestKit } from '../../testing/auth-test-kit.js';
import { InvalidCredentialsError } from '../auth.errors.js';
import { LogInUseCase } from './log-in.use-case.js';

const valid = { email: 'ana@kambista.com', password: 'secret-password' };
const wrong = { ...valid, password: 'wrong-password' };

describe('LogInUseCase', () => {
  let kit: ReturnType<typeof createAuthTestKit>;
  let logIn: LogInUseCase;

  beforeEach(async () => {
    kit = createAuthTestKit();
    logIn = new LogInUseCase(kit.users, kit.passwordHasher, kit.sessions);
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
    await expect(logIn.execute(wrong)).rejects.toBeInstanceOf(
      InvalidCredentialsError,
    );
  });

  it('rejects an unknown email after simulating the password check', async () => {
    const simulateMatch = vi.spyOn(kit.passwordHasher, 'simulateMatch');

    await expect(
      logIn.execute({ ...wrong, email: 'nadie@kambista.com' }),
    ).rejects.toBeInstanceOf(InvalidCredentialsError);
    expect(simulateMatch).toHaveBeenCalledWith(wrong.password);
  });
});
