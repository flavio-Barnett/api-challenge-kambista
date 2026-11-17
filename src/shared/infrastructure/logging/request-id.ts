import { randomUUID } from 'node:crypto';
import type {
  IncomingHttpHeaders,
  IncomingMessage,
  ServerResponse,
} from 'node:http';

export const REQUEST_ID_HEADER = 'x-request-id';

const REQUEST_ID_PATTERN = /^[\w-]{1,128}$/;

function isValidRequestId(value: IncomingHttpHeaders[string]): value is string {
  return typeof value === 'string' && REQUEST_ID_PATTERN.test(value);
}

export function resolveRequestId(
  request: IncomingMessage,
  response: ServerResponse,
): string {
  const incoming = request.headers[REQUEST_ID_HEADER];
  const requestId = isValidRequestId(incoming) ? incoming : randomUUID();
  response.setHeader(REQUEST_ID_HEADER, requestId);
  return requestId;
}
