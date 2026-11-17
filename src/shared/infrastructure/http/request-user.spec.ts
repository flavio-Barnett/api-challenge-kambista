import { requestUserId } from './request-user.js';

describe('requestUserId', () => {
  it('reads the id of the authenticated user', () => {
    expect(requestUserId({ user: { id: 'user-1', role: 'admin' } })).toBe(
      'user-1',
    );
  });

  it.each([{}, { user: undefined }, { user: null }, { user: { id: 7 } }])(
    'returns undefined for an anonymous request %j',
    (request) => {
      expect(requestUserId(request)).toBeUndefined();
    },
  );
});
