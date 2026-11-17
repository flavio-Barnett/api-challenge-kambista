import { User } from '../../domain/entities/user.entity.js';
import { Email } from '../../domain/value-objects/email.vo.js';
import { createAuthTestKit } from '../../testing/auth-test-kit.js';

describe('SessionIssuerService', () => {
  it('returns an access token for the user', async () => {
    const kit = createAuthTestKit();
    const user = await kit.users.create(
      User.prepareRegistration('Ana', Email.create('ana@kambista.com'), 'h'),
    );

    const session = await kit.sessions.start(user);

    expect(session).toEqual({ user, accessToken: `access-token:${user.id}` });
  });
});
