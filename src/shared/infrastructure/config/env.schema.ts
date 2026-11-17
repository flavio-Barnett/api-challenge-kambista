import { z } from 'zod';

const commaSeparatedList = z
  .string()
  .default('')
  .transform((value) =>
    value
      .split(',')
      .map((item) => item.trim())
      .filter((item) => item.length > 0),
  );

const DURATION_PATTERN = /^\d+[smhd]$/;

function unitInMilliseconds(unit: string): number {
  switch (unit) {
    case 's':
      return 1000;
    case 'm':
      return 60 * 1000;
    case 'h':
      return 60 * 60 * 1000;
    default:
      return 24 * 60 * 60 * 1000;
  }
}

function toMilliseconds(duration: string): number {
  return Number(duration.slice(0, -1)) * unitInMilliseconds(duration.slice(-1));
}

const tokenLifetime = z
  .string()
  .regex(DURATION_PATTERN, 'Expected a duration such as 30s, 15m, 12h or 7d')
  .transform(toMilliseconds);

export const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  MONGODB_URI: z.string().min(1),
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRES_IN: tokenLifetime.prefault('15m'),
  REFRESH_TOKEN_EXPIRES_IN: tokenLifetime.prefault('7d'),
  CORS_ORIGINS: commaSeparatedList,
  EXCHANGE_RATE_PROVIDER_URL: z
    .url()
    .default('https://api.apis.net.pe/v1/tipo-cambio-sunat'),
  EXCHANGE_RATE_REFRESH_INTERVAL_MS: z.coerce
    .number()
    .int()
    .positive()
    .default(30000),
});

export type Env = z.infer<typeof envSchema>;
