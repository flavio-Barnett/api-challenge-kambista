import type { Request } from 'express';

import { refreshTokenFrom } from './refresh-token-from-cookie.decorator.js';

function requestWith(cookies: unknown): Request {
  return { cookies } as Request;
}

describe('refreshTokenFrom', () => {
  it('reads the refresh token cookie', () => {
    expect(refreshTokenFrom(requestWith({ refresh_token: 'token' }))).toBe(
      'token',
    );
  });

  it.each([
    ['no cookies', undefined],
    ['another cookie', { session: 'x' }],
    ['an empty value', { refresh_token: '' }],
    ['a non string value', { refresh_token: ['a', 'b'] }],
  ])('returns undefined for %s', (_case, cookies) => {
    expect(refreshTokenFrom(requestWith(cookies))).toBeUndefined();
  });
});
