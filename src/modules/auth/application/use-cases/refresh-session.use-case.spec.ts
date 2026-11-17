import { User } from '../../domain/entities/user.entity.js';
import { Email } from '../../domain/value-objects/email.vo.js';
import {
  createAuthTestKit,
  REFRESH_TOKEN_TTL_MS,
} from '../../testing/auth-test-kit.js';
import { InvalidRefreshTokenError } from '../auth.errors.js';
import type { AuthSession } from '../services/session-issuer.service.js';
import { LogOutUseCase } from './log-out.use-case.js';
import { RefreshSessionUseCase } from './refresh-session.use-case.js';

describe('RefreshSessionUseCase and LogOutUseCase', () => {
  let kit: ReturnType<typeof createAuthTestKit>;
  let refreshSession: RefreshSessionUseCase;
  let logOut: LogOutUseCase;
  let initial: AuthSession;

  beforeEach(async () => {
    kit = createAuthTestKit();
    refreshSession = new RefreshSessionUseCase(
      kit.users,
      kit.refreshTokens,
      kit.refreshTokenStore,
      kit.sessions,
      kit.clock,
    );
    logOut = new LogOutUseCase(
      kit.refreshTokens,
      kit.refreshTokenStore,
      kit.clock,
    );
    const user = await kit.users.create(
      User.prepareRegistration('Ana', Email.create('ana@kambista.com'), 'h'),
    );
    initial = await kit.sessions.start(user);
  });

  it('rotates the refresh token', async () => {
    const rotated = await refreshSession.execute(initial.refreshToken);

    expect(rotated.refreshToken).not.toBe(initial.refreshToken);
    await expect(
      refreshSession.execute(initial.refreshToken),
    ).rejects.toBeInstanceOf(InvalidRefreshTokenError);
  });

  it('revokes every session of the user when a used token is replayed', async () => {
    const rotated = await refreshSession.execute(initial.refreshToken);

    await expect(
      refreshSession.execute(initial.refreshToken),
    ).rejects.toBeInstanceOf(InvalidRefreshTokenError);
    await expect(
      refreshSession.execute(rotated.refreshToken),
    ).rejects.toBeInstanceOf(InvalidRefreshTokenError);
    expect(kit.refreshTokenStore.activeTokensOf(initial.user.id)).toBe(0);
  });

  it('rejects expired refresh tokens', async () => {
    kit.clock.advanceBy(REFRESH_TOKEN_TTL_MS + 1);

    await expect(
      refreshSession.execute(initial.refreshToken),
    ).rejects.toBeInstanceOf(InvalidRefreshTokenError);
  });

  it('rejects unknown refresh tokens', async () => {
    await expect(refreshSession.execute('unknown')).rejects.toBeInstanceOf(
      InvalidRefreshTokenError,
    );
  });

  it('logs out by revoking the refresh token', async () => {
    await logOut.execute(initial.refreshToken);

    await expect(
      refreshSession.execute(initial.refreshToken),
    ).rejects.toBeInstanceOf(InvalidRefreshTokenError);
  });
});
