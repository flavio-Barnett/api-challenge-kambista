import type { IncomingMessage, ServerResponse } from 'node:http';
import { resolveLogLevel } from './logger.params.js';

const request = {} as IncomingMessage;

function responseWithStatus(statusCode: number): ServerResponse {
  return { statusCode } as ServerResponse;
}

describe('resolveLogLevel', () => {
  it.each([
    [200, 'info'],
    [201, 'info'],
    [400, 'warn'],
    [404, 'warn'],
    [500, 'error'],
    [503, 'error'],
  ])('logs a %i response as %s', (statusCode, expected) => {
    expect(resolveLogLevel(request, responseWithStatus(statusCode))).toBe(
      expected,
    );
  });

  it('logs as error when the request failed with an error', () => {
    const level = resolveLogLevel(
      request,
      responseWithStatus(200),
      new Error('socket hang up'),
    );

    expect(level).toBe('error');
  });
});
