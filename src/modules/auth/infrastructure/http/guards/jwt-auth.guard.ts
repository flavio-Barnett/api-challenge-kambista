import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';

import { IS_PUBLIC_KEY } from '../../../../../shared/infrastructure/http/public.decorator.js';
import type { AccessTokenPayload } from '../../security/access-token-payload.type.js';
import type { AuthenticatedRequest } from './authenticated-user.type.js';
import { InvalidAccessTokenError } from './guard.errors.js';

const BEARER_PREFIX = 'Bearer ';

function extractBearerToken(request: AuthenticatedRequest): string {
  const header = request.headers.authorization;
  if (!header?.startsWith(BEARER_PREFIX)) {
    throw new InvalidAccessTokenError();
  }
  return header.slice(BEARER_PREFIX.length);
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwt: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (this.isPublic(context)) {
      return true;
    }
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const payload = await this.verify(extractBearerToken(request));
    request.user = { id: payload.sub, role: payload.role };
    return true;
  }

  private isPublic(context: ExecutionContext): boolean {
    return (
      this.reflector.getAllAndOverride<boolean | undefined>(IS_PUBLIC_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) === true
    );
  }

  private async verify(token: string): Promise<AccessTokenPayload> {
    try {
      return await this.jwt.verifyAsync<AccessTokenPayload>(token);
    } catch {
      throw new InvalidAccessTokenError();
    }
  }
}
