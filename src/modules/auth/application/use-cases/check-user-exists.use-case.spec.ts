import { User } from '../../domain/entities/user.entity.js';
import { Email } from '../../domain/value-objects/email.vo.js';
import { InMemoryUserRepository } from '../../testing/in-memory-user.repository.js';
import { CheckUserExistsUseCase } from './check-user-exists.use-case.js';

describe('CheckUserExistsUseCase', () => {
  it('confirms a registered user', async () => {
    const users = new InMemoryUserRepository();
    const created = await users.create(
      User.prepareRegistration('Ana', Email.create('ana@kambista.com'), 'h'),
    );

    await expect(
      new CheckUserExistsUseCase(users).execute(created.id),
    ).resolves.toBe(true);
  });

  it('denies an unknown user', async () => {
    await expect(
      new CheckUserExistsUseCase(new InMemoryUserRepository()).execute(
        'missing',
      ),
    ).resolves.toBe(false);
  });
});
