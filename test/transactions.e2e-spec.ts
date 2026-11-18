import request from 'supertest';

import { limaDate } from './support/dates.js';
import {
  ALLOWED_ORIGIN,
  startTestApp,
  type TestApp,
} from './support/test-app.js';
import {
  bearer,
  registerAdmin,
  registerUser,
  type TestUser,
} from './support/users.js';

const usdToPen = { monedaOrigen: 'USD', monedaDestino: 'PEN', monto: 100 };
const penToUsd = { monedaOrigen: 'PEN', monedaDestino: 'USD', monto: 100 };

describe('Transactions (e2e)', () => {
  let testApp: TestApp;

  beforeAll(async () => {
    testApp = await startTestApp();
  });

  afterAll(async () => {
    await testApp.close();
  });

  function create(user: TestUser, body: object): request.Test {
    return request(testApp.server)
      .post('/v1/transactions')
      .set('Authorization', bearer(user))
      .send(body);
  }

  function history(user: TestUser, query: object = {}): request.Test {
    return request(testApp.server)
      .get('/v1/transactions/history')
      .set('Authorization', bearer(user))
      .query({ startDate: limaDate(-1), endDate: limaDate(1), ...query });
  }

  describe('without an exchange rate', () => {
    it('rejects the exchange with 503', async () => {
      const user = await registerUser(testApp.server, 'early@test.com');

      const response = await create(user, usdToPen).expect(503);

      expect(response.body).toMatchObject({
        error: { code: 'EXCHANGE_RATE_NOT_AVAILABLE' },
      });
    });
  });

  describe('with the current exchange rate', () => {
    let ana: TestUser;

    beforeAll(async () => {
      testApp.rates.willQuote('3.728', '3.739', '2026-11-18');
      await testApp.refreshRate();
      ana = await registerUser(testApp.server, 'ana@test.com');
    });

    it('converts dollars to soles with the sell rate', async () => {
      const response = await create(ana, usdToPen).expect(201);

      expect(response.body).toMatchObject({
        monedaOrigen: 'USD',
        monedaDestino: 'PEN',
        monto: 100,
        montoCambiado: 373.9,
        tipoCambio: 3.739,
      });
      expect(Object.keys(response.body as object)).toEqual([
        'id',
        'monedaOrigen',
        'monedaDestino',
        'monto',
        'montoCambiado',
        'tipoCambio',
        'fecha',
      ]);
    });

    it('converts soles to dollars with the buy rate rounded to cents', async () => {
      const response = await create(ana, penToUsd).expect(201);

      expect(response.body).toMatchObject({
        montoCambiado: 26.82,
        tipoCambio: 3.728,
      });
    });

    it('rejects equal currencies', async () => {
      const response = await create(ana, {
        ...usdToPen,
        monedaDestino: 'USD',
      }).expect(400);

      expect(response.body).toMatchObject({
        error: { code: 'SAME_CURRENCY' },
      });
    });

    it.each([0, -5, 1.234, 1e-7, 10_000_000])(
      'rejects the amount %s',
      async (monto) => {
        const response = await create(ana, { ...usdToPen, monto }).expect(400);

        expect(response.body).toMatchObject({
          error: { code: 'INVALID_AMOUNT' },
        });
      },
    );

    it('rejects an amount sent as text', async () => {
      const response = await create(ana, { ...usdToPen, monto: '100' }).expect(
        400,
      );

      expect(response.body).toMatchObject({
        error: { code: 'VALIDATION_ERROR' },
      });
    });

    it('rejects unknown fields in the body', async () => {
      await create(ana, { ...usdToPen, userId: 'someone-else' }).expect(400);
    });
  });

  describe('history', () => {
    let bruno: TestUser;
    let carla: TestUser;
    let admin: TestUser;

    beforeAll(async () => {
      bruno = await registerUser(testApp.server, 'bruno@test.com');
      carla = await registerUser(testApp.server, 'carla@test.com');
      admin = await registerAdmin(testApp, 'admin@test.com');
      for (const monto of [10, 20, 30]) {
        await create(bruno, { ...usdToPen, monto }).expect(201);
      }
      await create(carla, penToUsd).expect(201);
      await create(admin, penToUsd).expect(201);
    });

    it('returns only the user transactions, newest first', async () => {
      const response = await history(bruno).expect(200);

      expect(response.headers['x-total-count']).toBe('3');
      expect(
        (response.body as { monto: number }[]).map((item) => item.monto),
      ).toEqual([30, 20, 10]);
    });

    it('ignores the userId sent by a user', async () => {
      const response = await history(bruno, { userId: carla.id }).expect(200);

      expect(response.headers['x-total-count']).toBe('3');
    });

    it('paginates with page and limit', async () => {
      const response = await history(bruno, { page: 2, limit: 2 }).expect(200);

      expect(response.headers['x-total-count']).toBe('3');
      expect(response.body).toEqual([expect.objectContaining({ monto: 10 })]);
    });

    it('shows an admin their own history without userId', async () => {
      const response = await history(admin).expect(200);

      expect(response.headers['x-total-count']).toBe('1');
    });

    it('lets an admin read another user history', async () => {
      const response = await history(admin, { userId: bruno.id }).expect(200);

      expect(response.headers['x-total-count']).toBe('3');
    });

    it.each(['000000000000000000000000', 'not-an-id'])(
      'responds 404 when an admin asks for the unknown user %s',
      async (userId) => {
        const response = await history(admin, { userId }).expect(404);

        expect(response.body).toMatchObject({
          error: { code: 'USER_NOT_FOUND' },
        });
      },
    );

    it('rejects a start date after the end date', async () => {
      const response = await history(bruno, {
        startDate: limaDate(1),
        endDate: limaDate(-1),
      }).expect(400);

      expect(response.body).toMatchObject({
        error: { code: 'INVALID_DATE_RANGE' },
      });
    });

    it('exposes the total count header to the allowed origin', async () => {
      const response = await history(bruno)
        .set('Origin', ALLOWED_ORIGIN)
        .expect(200);

      expect(response.headers['access-control-expose-headers']).toContain(
        'X-Total-Count',
      );
    });

    it.each([
      ['missing dates', { startDate: undefined, endDate: undefined }],
      ['a limit above 100', { limit: 101 }],
    ])('rejects %s', async (_case, query) => {
      await history(bruno, query).expect(400);
    });
  });

  describe('history dates in Lima time', () => {
    let diego: TestUser;

    beforeAll(async () => {
      diego = await registerUser(testApp.server, 'diego@test.com');
      testApp.clock.freezeAt(new Date('2026-11-10T04:30:00Z'));
      await create(diego, { ...usdToPen, monto: 1 }).expect(201);
      testApp.clock.freezeAt(new Date('2026-11-10T05:00:00Z'));
      await create(diego, { ...usdToPen, monto: 2 }).expect(201);
      testApp.clock.resume();
    });

    it('includes the whole end date and excludes the next Lima day', async () => {
      const response = await history(diego, {
        startDate: '2026-11-09',
        endDate: '2026-11-09',
      }).expect(200);

      expect(response.body).toEqual([expect.objectContaining({ monto: 1 })]);
    });

    it('starts the next day at midnight Lima time', async () => {
      const response = await history(diego, {
        startDate: '2026-11-10',
        endDate: '2026-11-10',
      }).expect(200);

      expect(response.body).toEqual([expect.objectContaining({ monto: 2 })]);
    });
  });
});
