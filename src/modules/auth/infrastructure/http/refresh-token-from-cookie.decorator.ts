import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';

import { REFRESH_TOKEN_COOKIE } from './refresh-token.cookie.js';

export function refreshTokenFrom(request: Request): string | undefined {
  const cookies: unknown = request.cookies;
  if (typeof cookies !== 'object' || cookies === null) {
    return undefined;
  }
  const value: unknown = (cookies as Record<string, unknown>)[
    REFRESH_TOKEN_COOKIE
  ];
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

export const RefreshTokenFromCookie = createParamDecorator(
  (_data: unknown, context: ExecutionContext): string | undefined =>
    refreshTokenFrom(context.switchToHttp().getRequest<Request>()),
);
