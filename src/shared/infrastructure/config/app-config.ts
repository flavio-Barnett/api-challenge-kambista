import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import type { Env } from './env.schema.js';

interface JwtTokenConfig {
  readonly secret: string;
  readonly ttlMs: number;
}

@Injectable()
export class AppConfig {
  constructor(private readonly config: ConfigService<Env, true>) {}

  get nodeEnv(): Env['NODE_ENV'] {
    return this.get('NODE_ENV');
  }

  get isProduction(): boolean {
    return this.nodeEnv === 'production';
  }

  get port(): number {
    return this.get('PORT');
  }

  get mongoUri(): string {
    return this.get('MONGODB_URI');
  }

  get corsOrigins(): readonly string[] {
    return this.get('CORS_ORIGINS');
  }

  get trustProxyHops(): number {
    return this.get('TRUST_PROXY_HOPS');
  }

  get accessToken(): JwtTokenConfig {
    return {
      secret: this.get('JWT_ACCESS_SECRET'),
      ttlMs: this.get('JWT_ACCESS_EXPIRES_IN'),
    };
  }

  get refreshTokenTtlMs(): number {
    return this.get('REFRESH_TOKEN_EXPIRES_IN');
  }

  get refreshCookieSecure(): boolean {
    return this.get('REFRESH_COOKIE_SECURE') ?? this.isProduction;
  }

  get exchangeRateProviderUrl(): string {
    return this.get('EXCHANGE_RATE_PROVIDER_URL');
  }

  get exchangeRateRefreshIntervalMs(): number {
    return this.get('EXCHANGE_RATE_REFRESH_INTERVAL_MS');
  }

  private get<K extends keyof Env>(key: K): Env[K] {
    return this.config.get(key, { infer: true });
  }
}
