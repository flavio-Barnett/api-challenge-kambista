import { EmailAlreadyRegisteredError } from '../../domain/auth.errors.js';
import { createAuthTestKit } from '../../testing/auth-test-kit.js';
import { RegisterUserUseCase } from './register-user.use-case.js';

const command = {
  name: 'Ana Pérez',
  email: 'Ana@Kambista.com',
  password: 'secret-password',
};

describe('RegisterUserUseCase', () => {
  let registerUser: RegisterUserUseCase;

  beforeEach(() => {
    const kit = createAuthTestKit();
    registerUser = new RegisterUserUseCase(
      kit.users,
      kit.passwordHasher,
      kit.sessions,
    );
  });

  it('stores the user with a hashed password and the default role', async () => {
    const { user } = await registerUser.execute(command);

    expect(user.email.value).toBe('ana@kambista.com');
    expect(user.passwordHash).toBe('hashed:secret-password');
    expect(user.role).toBe('user');
  });

  it('signs the new user in', async () => {
    const session = await registerUser.execute(command);

    expect(session.accessToken).toBe(`access-token:${session.user.id}`);
    expect(session.refreshToken).toBe('refresh-1');
  });

  it('rejects an email that is already registered', async () => {
    await registerUser.execute(command);

    await expect(
      registerUser.execute({ ...command, email: 'ANA@kambista.com' }),
    ).rejects.toBeInstanceOf(EmailAlreadyRegisteredError);
  });
});
