import { ConfigService } from '@nestjs/config';

import { AppConfig } from './app-config.js';
import { type Env, envSchema } from './env.schema.js';

function configFor(variables: Record<string, string>): AppConfig {
  const env = envSchema.parse({
    MONGODB_URI: 'mongodb://localhost:27017/kambista',
    JWT_ACCESS_SECRET: 'a'.repeat(32),
    ...variables,
  });
  return new AppConfig(new ConfigService<Env, true>(env));
}

describe('AppConfig', () => {
  it.each([
    [{ NODE_ENV: 'production' }, true],
    [{ NODE_ENV: 'development' }, false],
    [{ NODE_ENV: 'production', REFRESH_COOKIE_SECURE: 'false' }, false],
    [{ NODE_ENV: 'development', REFRESH_COOKIE_SECURE: 'true' }, true],
  ])('resolves the refresh cookie Secure flag for %j', (variables, secure) => {
    expect(configFor(variables).refreshCookieSecure).toBe(secure);
  });
});
