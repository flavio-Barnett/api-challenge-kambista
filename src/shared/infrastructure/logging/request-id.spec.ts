import type { IncomingMessage, ServerResponse } from 'node:http';

import { REQUEST_ID_HEADER, resolveRequestId } from './request-id.js';

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

function createExchange(header?: string): {
  request: IncomingMessage;
  response: ServerResponse;
  setHeader: ReturnType<typeof vi.fn>;
} {
  const setHeader = vi.fn();
  const request = {
    headers: header === undefined ? {} : { [REQUEST_ID_HEADER]: header },
  } as IncomingMessage;
  const response = { setHeader } as unknown as ServerResponse;
  return { request, response, setHeader };
}

describe('resolveRequestId', () => {
  it('reuses the incoming request id and echoes it back', () => {
    const { request, response, setHeader } = createExchange('abc-123');

    expect(resolveRequestId(request, response)).toBe('abc-123');
    expect(setHeader).toHaveBeenCalledWith(REQUEST_ID_HEADER, 'abc-123');
  });

  it('generates a uuid when the header is missing', () => {
    const { request, response } = createExchange();

    expect(resolveRequestId(request, response)).toMatch(UUID_PATTERN);
  });

  it.each([
    ['too long', 'x'.repeat(129)],
    ['empty', ''],
    ['with unsafe characters', 'abc\n{"level":60}'],
  ])('generates a uuid when the incoming id is %s', (_case, header) => {
    const { request, response } = createExchange(header);

    expect(resolveRequestId(request, response)).toMatch(UUID_PATTERN);
  });
});
