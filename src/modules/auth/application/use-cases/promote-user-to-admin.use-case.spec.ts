import { UserNotFoundError } from '../../domain/auth.errors.js';
import { User } from '../../domain/entities/user.entity.js';
import { Email } from '../../domain/value-objects/email.vo.js';
import { InMemoryUserRepository } from '../../testing/in-memory-user.repository.js';
import { PromoteUserToAdminUseCase } from './promote-user-to-admin.use-case.js';

describe('PromoteUserToAdminUseCase', () => {
  it('grants the admin role to an existing user', async () => {
    const users = new InMemoryUserRepository();
    const created = await users.create(
      User.prepareRegistration('Ana', Email.create('ana@kambista.com'), 'h'),
    );

    const promoted = await new PromoteUserToAdminUseCase(users).execute(
      'ANA@kambista.com',
    );

    expect(promoted.role).toBe('admin');
    expect((await users.findById(created.id))?.role).toBe('admin');
  });

  it('fails for an unknown email', async () => {
    await expect(
      new PromoteUserToAdminUseCase(new InMemoryUserRepository()).execute(
        'nadie@kambista.com',
      ),
    ).rejects.toBeInstanceOf(UserNotFoundError);
  });
});
