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

const tokenLifetime = z
  .string()
  .regex(/^\d+[smhd]$/, 'Expected a duration such as 30s, 15m, 12h or 7d');

export const envSchema = z
  .object({
    NODE_ENV: z
      .enum(['development', 'production', 'test'])
      .default('development'),
    PORT: z.coerce.number().int().positive().default(3000),
    MONGODB_URI: z.string().min(1),
    JWT_ACCESS_SECRET: z.string().min(32),
    JWT_ACCESS_EXPIRES_IN: tokenLifetime.default('15m'),
    JWT_REFRESH_SECRET: z.string().min(32),
    JWT_REFRESH_EXPIRES_IN: tokenLifetime.default('7d'),
    CORS_ORIGINS: commaSeparatedList,
    EXCHANGE_RATE_PROVIDER_URL: z
      .url()
      .default('https://api.apis.net.pe/v1/tipo-cambio-sunat'),
    EXCHANGE_RATE_REFRESH_INTERVAL_MS: z.coerce
      .number()
      .int()
      .positive()
      .default(30000),
  })
  .refine((env) => env.JWT_ACCESS_SECRET !== env.JWT_REFRESH_SECRET, {
    message: 'JWT_REFRESH_SECRET must differ from JWT_ACCESS_SECRET',
    path: ['JWT_REFRESH_SECRET'],
  });

export type Env = z.infer<typeof envSchema>;
