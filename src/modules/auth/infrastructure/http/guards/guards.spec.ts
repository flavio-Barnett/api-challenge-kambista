import type { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';

import type { Role } from '../../../../../shared/domain/role.type.js';
import type { AppConfig } from '../../../../../shared/infrastructure/config/app-config.js';
import type { AuthenticatedRequest } from '../../../../../shared/infrastructure/http/authenticated-user.type.js';
import { InvalidAccessTokenError } from '../../../../../shared/infrastructure/http/errors/invalid-access-token.error.js';
import { accessTokenJwtOptions } from '../../security/jwt-options.js';
import {
  InsufficientRoleError,
  OriginNotAllowedError,
} from './guard.errors.js';
import { JwtAuthGuard } from './jwt-auth.guard.js';
import { RolesGuard } from './roles.guard.js';
import { TrustedOriginGuard } from './trusted-origin.guard.js';

const SECRET = 'a'.repeat(32);
const TTL_MS = 15 * 60 * 1000;

function contextFor(request: Partial<AuthenticatedRequest>): ExecutionContext {
  return {
    getHandler: () => undefined,
    getClass: () => undefined,
    switchToHttp: () => ({ getRequest: () => request }),
  } as unknown as ExecutionContext;
}

function reflectorReturning(value: unknown): Reflector {
  const reflector = new Reflector();
  vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(value);
  return reflector;
}

describe('JwtAuthGuard', () => {
  const jwt = new JwtService(accessTokenJwtOptions(SECRET, TTL_MS));

  it('lets public routes through without a token', async () => {
    const guard = new JwtAuthGuard(reflectorReturning(true), jwt);

    await expect(guard.canActivate(contextFor({ headers: {} }))).resolves.toBe(
      true,
    );
  });

  it('attaches the authenticated user from a valid bearer token', async () => {
    const guard = new JwtAuthGuard(reflectorReturning(undefined), jwt);
    const token = await jwt.signAsync({ sub: 'user-1', role: 'admin' });
    const request: Partial<AuthenticatedRequest> = {
      headers: { authorization: `Bearer ${token}` },
    };

    await guard.canActivate(contextFor(request));

    expect(request.user).toEqual({ id: 'user-1', role: 'admin' });
  });

  it.each([undefined, 'Bearer not-a-jwt', 'Basic abc'])(
    'rejects the authorization header %j',
    async (authorization) => {
      const guard = new JwtAuthGuard(reflectorReturning(undefined), jwt);

      await expect(
        guard.canActivate(contextFor({ headers: { authorization } })),
      ).rejects.toBeInstanceOf(InvalidAccessTokenError);
    },
  );

  it('rejects tokens signed with an algorithm other than HS256', async () => {
    const guard = new JwtAuthGuard(reflectorReturning(undefined), jwt);
    const token = await jwt.signAsync(
      { sub: 'user-1', role: 'admin' },
      { algorithm: 'HS512' },
    );

    await expect(
      guard.canActivate(
        contextFor({ headers: { authorization: `Bearer ${token}` } }),
      ),
    ).rejects.toBeInstanceOf(InvalidAccessTokenError);
  });

  it('rejects tokens signed with another secret', async () => {
    const guard = new JwtAuthGuard(reflectorReturning(undefined), jwt);
    const foreign = new JwtService({ secret: 'b'.repeat(32) });
    const token = await foreign.signAsync({ sub: 'user-1', role: 'admin' });

    await expect(
      guard.canActivate(
        contextFor({ headers: { authorization: `Bearer ${token}` } }),
      ),
    ).rejects.toBeInstanceOf(InvalidAccessTokenError);
  });
});

describe('RolesGuard', () => {
  function requestFrom(role: Role): Partial<AuthenticatedRequest> {
    return { user: { id: 'user-1', role } };
  }

  it('allows any authenticated user when no role is required', () => {
    const guard = new RolesGuard(reflectorReturning(undefined));

    expect(guard.canActivate(contextFor(requestFrom('user')))).toBe(true);
  });

  it('allows users with a required role', () => {
    const guard = new RolesGuard(reflectorReturning(['admin']));

    expect(guard.canActivate(contextFor(requestFrom('admin')))).toBe(true);
  });

  it('forbids users without a required role', () => {
    const guard = new RolesGuard(reflectorReturning(['admin']));

    expect(() => guard.canActivate(contextFor(requestFrom('user')))).toThrow(
      InsufficientRoleError,
    );
  });
});

describe('TrustedOriginGuard', () => {
  const guard = new TrustedOriginGuard({
    corsOrigins: ['http://localhost:3001'] as readonly string[],
  } as AppConfig);

  function requestFrom(origin?: string): Partial<Request> {
    return {
      protocol: 'https',
      host: 'api.kambista.test',
      headers: origin === undefined ? {} : { origin },
    };
  }

  it('allows requests without an Origin header', () => {
    expect(guard.canActivate(contextFor(requestFrom()))).toBe(true);
  });

  it('allows an origin listed in CORS_ORIGINS', () => {
    expect(
      guard.canActivate(contextFor(requestFrom('http://localhost:3001'))),
    ).toBe(true);
  });

  it('allows the API own origin as resolved behind proxies', () => {
    expect(
      guard.canActivate(contextFor(requestFrom('https://api.kambista.test'))),
    ).toBe(true);
  });

  it.each([
    'https://evil.example',
    'http://api.kambista.test',
    'null',
    'not a url',
  ])('forbids the origin %s', (origin) => {
    expect(() => guard.canActivate(contextFor(requestFrom(origin)))).toThrow(
      OriginNotAllowedError,
    );
  });
});
