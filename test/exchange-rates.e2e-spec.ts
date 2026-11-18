import request from 'supertest';

import { startTestApp, type TestApp } from './support/test-app.js';
import { bearer, registerUser, type TestUser } from './support/users.js';

describe('Exchange rates (e2e)', () => {
  let testApp: TestApp;
  let user: TestUser;

  beforeAll(async () => {
    testApp = await startTestApp();
    user = await registerUser(testApp.server, 'rates@test.com');
  });

  afterAll(async () => {
    await testApp.close();
  });

  it('requires a token', async () => {
    await request(testApp.server).get('/v1/exchange-rates/current').expect(401);
  });

  it('responds 503 while no exchange rate has been obtained', async () => {
    const response = await request(testApp.server)
      .get('/v1/exchange-rates/current')
      .set('Authorization', bearer(user))
      .expect(503);

    expect(response.body).toMatchObject({
      error: { code: 'EXCHANGE_RATE_NOT_AVAILABLE' },
    });
  });

  it('returns the current rate once the provider answers', async () => {
    testApp.rates.willQuote('3.728', '3.739', '2026-11-18');
    await testApp.refreshRate();

    const response = await request(testApp.server)
      .get('/v1/exchange-rates/current')
      .set('Authorization', bearer(user))
      .expect(200);

    expect(response.body).toMatchObject({
      compra: 3.728,
      venta: 3.739,
      fecha: '2026-11-18',
    });
    expect(Object.keys(response.body as object)).toEqual([
      'compra',
      'venta',
      'fecha',
      'validFrom',
      'lastCheckedAt',
    ]);
  });
});
