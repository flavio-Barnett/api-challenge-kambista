import { User } from '../../domain/entities/user.entity.js';
import { Email } from '../../domain/value-objects/email.vo.js';
import { InMemoryUserRepository } from '../../testing/in-memory-user.repository.js';
import { InvalidSessionError } from '../auth.errors.js';
import { GetCurrentUserUseCase } from './get-current-user.use-case.js';

describe('GetCurrentUserUseCase', () => {
  it('returns the authenticated user', async () => {
    const users = new InMemoryUserRepository();
    const created = await users.create(
      User.prepareRegistration('Ana', Email.create('ana@kambista.com'), 'h'),
    );

    const user = await new GetCurrentUserUseCase(users).execute(created.id);

    expect(user.email.value).toBe('ana@kambista.com');
  });

  it('treats a token of a deleted user as an invalid session', async () => {
    await expect(
      new GetCurrentUserUseCase(new InMemoryUserRepository()).execute(
        'missing',
      ),
    ).rejects.toBeInstanceOf(InvalidSessionError);
  });
});
