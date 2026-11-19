import type { CookieOptions, Response } from 'express';

import type { AppConfig } from '../../../../shared/infrastructure/config/app-config.js';
import { RefreshTokenCookie } from './refresh-token.cookie.js';

interface RecordedCall {
  readonly name: string;
  readonly value?: string;
  readonly options: CookieOptions;
}

function recordingResponse(): { response: Response; calls: RecordedCall[] } {
  const calls: RecordedCall[] = [];
  const response = {
    cookie: (name: string, value: string, options: CookieOptions) => {
      calls.push({ name, value, options });
    },
    clearCookie: (name: string, options: CookieOptions) => {
      calls.push({ name, options });
    },
  } as unknown as Response;
  return { response, calls };
}

describe('RefreshTokenCookie', () => {
  const cookie = new RefreshTokenCookie({
    refreshCookieSecure: true,
    refreshTokenTtlMs: 60_000,
  } as AppConfig);
  const attributes = {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    path: '/v1/auth',
  };

  it('writes a secure, httponly cookie scoped to the auth routes', () => {
    const { response, calls } = recordingResponse();

    cookie.write(response, 'token');

    expect(calls).toEqual([
      {
        name: 'refresh_token',
        value: 'token',
        options: { ...attributes, maxAge: 60_000 },
      },
    ]);
  });

  it('clears the cookie with the same attributes it was written with', () => {
    const { response, calls } = recordingResponse();

    cookie.clear(response);

    expect(calls).toEqual([{ name: 'refresh_token', options: attributes }]);
  });
});
