import { envSchema } from './env.schema.js';

const validEnv = {
  MONGODB_URI: 'mongodb://localhost:27017/kambista',
  JWT_ACCESS_SECRET: 'a'.repeat(32),
  JWT_REFRESH_SECRET: 'b'.repeat(32),
};

describe('envSchema', () => {
  it('applies defaults for optional variables', () => {
    const env = envSchema.parse(validEnv);

    expect(env).toMatchObject({
      NODE_ENV: 'development',
      PORT: 3000,
      JWT_ACCESS_EXPIRES_IN: '15m',
      JWT_REFRESH_EXPIRES_IN: '7d',
      CORS_ORIGINS: [],
      EXCHANGE_RATE_PROVIDER_URL:
        'https://api.apis.net.pe/v1/tipo-cambio-sunat',
      EXCHANGE_RATE_REFRESH_INTERVAL_MS: 30000,
    });
  });

  it('coerces numeric variables and splits cors origins', () => {
    const env = envSchema.parse({
      ...validEnv,
      PORT: '8080',
      CORS_ORIGINS: 'http://localhost:3001, https://kambista.com',
    });

    expect(env.PORT).toBe(8080);
    expect(env.CORS_ORIGINS).toEqual([
      'http://localhost:3001',
      'https://kambista.com',
    ]);
  });

  it('rejects a missing database uri', () => {
    const result = envSchema.safeParse({ ...validEnv, MONGODB_URI: undefined });

    expect(result.success).toBe(false);
  });

  it('rejects jwt secrets shorter than 32 characters', () => {
    const result = envSchema.safeParse({
      ...validEnv,
      JWT_ACCESS_SECRET: 'too-short',
    });

    expect(result.success).toBe(false);
  });

  it.each(['15 minutos', '15', 'm15', ''])(
    'rejects %j as a token lifetime',
    (lifetime) => {
      const result = envSchema.safeParse({
        ...validEnv,
        JWT_ACCESS_EXPIRES_IN: lifetime,
      });

      expect(result.success).toBe(false);
    },
  );

  it('rejects identical access and refresh secrets', () => {
    const result = envSchema.safeParse({
      ...validEnv,
      JWT_REFRESH_SECRET: validEnv.JWT_ACCESS_SECRET,
    });

    expect(result.success).toBe(false);
  });
});
