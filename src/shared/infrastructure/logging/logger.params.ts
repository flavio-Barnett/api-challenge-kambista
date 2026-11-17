import type { IncomingMessage, ServerResponse } from 'node:http';

import type { Params } from 'nestjs-pino';
import type { LevelWithSilent, TransportSingleOptions } from 'pino';

import type { Env } from '../config/env.schema.js';
import { HEALTH_PATH } from '../health/health.controller.js';
import { requestUserId } from '../http/request-user.js';
import { resolveRequestId } from './request-id.js';

const REDACTED_PATHS = [
  'req.headers.authorization',
  'req.headers.cookie',
  'password',
  'token',
  'accessToken',
  'refreshToken',
  'access_token',
  'refresh_token',
  '*.password',
  '*.token',
  '*.accessToken',
  '*.refreshToken',
  '*.access_token',
  '*.refresh_token',
];

type NodeEnv = Env['NODE_ENV'];

const LOG_LEVELS: Record<NodeEnv, string> = {
  production: 'info',
  development: 'debug',
  test: 'silent',
};

const TRANSPORTS: Partial<Record<NodeEnv, TransportSingleOptions>> = {
  development: { target: 'pino-pretty', options: { singleLine: true } },
};

export function resolveLogLevel(
  _request: IncomingMessage,
  response: ServerResponse,
  error?: Error,
): LevelWithSilent {
  if (error !== undefined || response.statusCode >= 500) {
    return 'error';
  }
  return response.statusCode >= 400 ? 'warn' : 'info';
}

function isHealthProbe(request: IncomingMessage): boolean {
  return request.url === `/${HEALTH_PATH}`;
}

export function buildLoggerParams(nodeEnv: NodeEnv): Params {
  return {
    pinoHttp: {
      level: LOG_LEVELS[nodeEnv],
      genReqId: resolveRequestId,
      customLogLevel: resolveLogLevel,
      customProps: (request: IncomingMessage) => ({
        userId: requestUserId(request),
      }),
      autoLogging: { ignore: isHealthProbe },
      redact: { paths: REDACTED_PATHS, censor: '[REDACTED]' },
      transport: TRANSPORTS[nodeEnv],
    },
  };
}
