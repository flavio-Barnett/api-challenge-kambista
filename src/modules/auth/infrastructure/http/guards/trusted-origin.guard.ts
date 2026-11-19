import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
} from '@nestjs/common';
import type { Request } from 'express';

import { AppConfig } from '../../../../../shared/infrastructure/config/app-config.js';
import { OriginNotAllowedError } from './guard.errors.js';

@Injectable()
export class TrustedOriginGuard implements CanActivate {
  constructor(private readonly config: AppConfig) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const { origin } = request.headers;
    const ownOrigin = `${request.protocol}://${request.host}`;
    const isTrusted =
      origin === undefined ||
      origin === ownOrigin ||
      this.config.corsOrigins.includes(origin);
    if (!isTrusted) {
      throw new OriginNotAllowedError();
    }
    return true;
  }
}
