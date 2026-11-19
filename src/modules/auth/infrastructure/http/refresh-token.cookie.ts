import { Injectable } from '@nestjs/common';
import type { CookieOptions, Response } from 'express';

import { AppConfig } from '../../../../shared/infrastructure/config/app-config.js';

export const REFRESH_TOKEN_COOKIE = 'refresh_token';

export const REFRESH_TOKEN_COOKIE_PATH = '/v1/auth';

@Injectable()
export class RefreshTokenCookie {
  private readonly options: CookieOptions;
  private readonly maxAgeMs: number;

  constructor(config: AppConfig) {
    this.options = {
      httpOnly: true,
      secure: config.refreshCookieSecure,
      sameSite: 'strict',
      path: REFRESH_TOKEN_COOKIE_PATH,
    };
    this.maxAgeMs = config.refreshTokenTtlMs;
  }

  write(response: Response, refreshToken: string): void {
    response.cookie(REFRESH_TOKEN_COOKIE, refreshToken, {
      ...this.options,
      maxAge: this.maxAgeMs,
    });
  }

  clear(response: Response): void {
    response.clearCookie(REFRESH_TOKEN_COOKIE, this.options);
  }
}
