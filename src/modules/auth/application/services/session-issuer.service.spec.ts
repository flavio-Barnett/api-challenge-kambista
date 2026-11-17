import { User } from '../../domain/entities/user.entity.js';
import { Email } from '../../domain/value-objects/email.vo.js';
import {
  createAuthTestKit,
  REFRESH_TOKEN_TTL_MS,
} from '../../testing/auth-test-kit.js';
import { FakeAccessTokenIssuer } from '../../testing/fake-access-token-issuer.js';
import { SessionIssuerService } from './session-issuer.service.js';

describe('SessionIssuerService', () => {
  let kit: ReturnType<typeof createAuthTestKit>;
  let user: User;

  beforeEach(async () => {
    kit = createAuthTestKit();
    user = await kit.users.create(
      User.prepareRegistration('Ana', Email.create('ana@kambista.com'), 'h'),
    );
  });

  it('returns an access token and a refresh token for the user', async () => {
    const session = await kit.sessions.start(user);

    expect(session).toEqual({
      user,
      accessToken: `access-token:${user.id}`,
      refreshToken: 'refresh-1',
    });
  });

  it('stores only the hash of the refresh token with its expiration', async () => {
    const save = vi.spyOn(kit.refreshTokenStore, 'save');

    await kit.sessions.start(user);

    expect(save).toHaveBeenCalledWith({
      tokenHash: 'hash:refresh-1',
      userId: user.id,
      expiresAt: new Date(kit.clock.now().getTime() + REFRESH_TOKEN_TTL_MS),
    });
  });

  it('stores nothing when the access token cannot be issued', async () => {
    const failingIssuer = new FakeAccessTokenIssuer();
    vi.spyOn(failingIssuer, 'issue').mockRejectedValue(new Error('down'));
    const save = vi.spyOn(kit.refreshTokenStore, 'save');
    const sessions = new SessionIssuerService(
      failingIssuer,
      kit.refreshTokens,
      kit.refreshTokenStore,
      kit.clock,
      REFRESH_TOKEN_TTL_MS,
    );

    await expect(sessions.start(user)).rejects.toThrow('down');
    expect(save).not.toHaveBeenCalled();
  });
});
