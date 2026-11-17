import type { JwtModuleOptions } from '@nestjs/jwt';

const ACCESS_TOKEN_ALGORITHM = 'HS256';
const MILLISECONDS_PER_SECOND = 1000;

export function accessTokenJwtOptions(
  secret: string,
  ttlMs: number,
): JwtModuleOptions {
  return {
    secret,
    signOptions: {
      algorithm: ACCESS_TOKEN_ALGORITHM,
      expiresIn: ttlMs / MILLISECONDS_PER_SECOND,
    },
    verifyOptions: { algorithms: [ACCESS_TOKEN_ALGORITHM] },
  };
}
