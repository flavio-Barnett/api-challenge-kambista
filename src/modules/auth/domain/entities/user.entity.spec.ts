import { InvalidUserNameError } from '../auth.errors.js';
import { Email } from '../value-objects/email.vo.js';
import { User } from './user.entity.js';

describe('User', () => {
  it('registers new users with the default role and a trimmed name', () => {
    const user = User.prepareRegistration(
      '  Ana Pérez ',
      Email.create('ana@kambista.com'),
      'hash',
    );

    expect(user).toMatchObject({ name: 'Ana Pérez', role: 'user' });
  });

  it.each(['', ' a ', 'x'.repeat(81)])('rejects the name %j', (name) => {
    expect(() =>
      User.prepareRegistration(name, Email.create('a@b.pe'), 'hash'),
    ).toThrow(InvalidUserNameError);
  });

  it('identifies administrators by role', () => {
    const admin = User.restore({
      id: '1',
      name: 'Admin',
      email: Email.create('admin@kambista.com'),
      passwordHash: 'hash',
      role: 'admin',
    });

    expect(admin.isAdmin()).toBe(true);
  });

  it('promotes a user to admin without mutating the original', () => {
    const user = User.restore({
      id: '1',
      name: 'Ana',
      email: Email.create('ana@kambista.com'),
      passwordHash: 'hash',
      role: 'user',
    });

    const promoted = user.promoteToAdmin();

    expect(promoted.isAdmin()).toBe(true);
    expect(user.isAdmin()).toBe(false);
  });
});
