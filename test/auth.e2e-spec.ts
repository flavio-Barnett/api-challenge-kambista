import request from 'supertest';

import { startTestApp, type TestApp } from './support/test-app.js';
import { bearer, registerUser } from './support/users.js';

const REFRESH_COOKIE = 'refresh_token';

function refreshCookie(response: request.Response): string {
  const setCookie = response.get('Set-Cookie') ?? [];
  const cookie = setCookie.find((value) =>
    value.startsWith(`${REFRESH_COOKIE}=`),
  );
  if (cookie === undefined) {
    throw new Error('The response did not set the refresh token cookie');
  }
  return cookie;
}

function cookiePair(cookie: string): string {
  return cookie.split(';')[0] ?? '';
}

describe('Auth (e2e)', () => {
  let testApp: TestApp;

  function refresh(cookie?: string): request.Test {
    const call = request(testApp.server).post('/v1/auth/refresh');
    return cookie === undefined ? call : call.set('Cookie', cookie);
  }

  beforeAll(async () => {
    testApp = await startTestApp();
  });

  afterAll(async () => {
    await testApp.close();
  });

  it('registers a user with the user role and starts a session', async () => {
    const response = await request(testApp.server)
      .post('/v1/auth/register')
      .send({ nombre: 'Ana', email: 'ana@test.com', password: 'Secreta123' })
      .expect(201);

    expect(Object.keys(response.body as object)).toEqual([
      'access_token',
      'usuario',
    ]);
    expect(response.body).toMatchObject({
      usuario: { nombre: 'Ana', email: 'ana@test.com', rol: 'user' },
    });
  });

  it('rejects a duplicated email', async () => {
    await registerUser(testApp.server, 'duplicated@test.com');

    const response = await request(testApp.server)
      .post('/v1/auth/register')
      .send({
        nombre: 'Otra',
        email: 'duplicated@test.com',
        password: 'Secreta123',
      })
      .expect(409);

    expect(response.body).toMatchObject({ success: false });
  });

  it('logs in with valid credentials', async () => {
    await registerUser(testApp.server, 'login@test.com');

    const response = await request(testApp.server)
      .post('/v1/auth/login')
      .send({ email: 'login@test.com', password: 'Secreta123' })
      .expect(200);

    expect(response.body).toMatchObject({
      usuario: { email: 'login@test.com', rol: 'user' },
    });
  });

  it('returns the authenticated user', async () => {
    const user = await registerUser(testApp.server, 'me@test.com');

    const response = await request(testApp.server)
      .get('/v1/auth/me')
      .set('Authorization', bearer(user))
      .expect(200);

    expect(response.body).toMatchObject({ id: user.id, email: 'me@test.com' });
  });

  it('rejects unknown fields on register', async () => {
    await request(testApp.server)
      .post('/v1/auth/register')
      .send({
        nombre: 'Eva',
        email: 'eva@test.com',
        password: 'Secreta123',
        rol: 'admin',
      })
      .expect(400);
  });

  it('blocks the login after 5 failed attempts', async () => {
    await registerUser(testApp.server, 'locked@test.com');
    const wrongLogin = { email: 'locked@test.com', password: 'Incorrecta1' };
    for (let attempt = 0; attempt < 5; attempt += 1) {
      await request(testApp.server)
        .post('/v1/auth/login')
        .send(wrongLogin)
        .expect(401);
    }

    const response = await request(testApp.server)
      .post('/v1/auth/login')
      .send(wrongLogin)
      .expect(429);

    expect(response.body).toMatchObject({
      error: { code: 'TOO_MANY_LOGIN_ATTEMPTS' },
    });
  });

  it('rotates the refresh token cookie and rejects the used one', async () => {
    const browser = request.agent(testApp.server);
    const registered = await browser
      .post('/v1/auth/register')
      .send({
        nombre: 'Rota',
        email: 'rotate@test.com',
        password: 'Secreta123',
      })
      .expect(201);
    const original = cookiePair(refreshCookie(registered));

    const rotated = await browser.post('/v1/auth/refresh').expect(200);

    expect(Object.keys(rotated.body as object)).toEqual(['access_token']);
    expect(cookiePair(refreshCookie(rotated))).not.toBe(original);
    await browser.post('/v1/auth/refresh').expect(200);
    await refresh(original).expect(401);
  });

  it('clears the cookie on logout and revokes the token', async () => {
    const browser = request.agent(testApp.server);
    const registered = await browser
      .post('/v1/auth/register')
      .send({
        nombre: 'Sale',
        email: 'logout@test.com',
        password: 'Secreta123',
      })
      .expect(201);
    const cookie = cookiePair(refreshCookie(registered));

    const response = await browser.post('/v1/auth/logout').expect(204);

    expect(refreshCookie(response)).toMatch(/Expires=Thu, 01 Jan 1970/);
    await browser.post('/v1/auth/refresh').expect(401);
    await refresh(cookie).expect(401);
  });

  it('rejects a protected route without a token', async () => {
    const response = await request(testApp.server)
      .get('/v1/auth/me')
      .expect(401);

    expect(response.body).toMatchObject({
      success: false,
      error: { code: 'INVALID_ACCESS_TOKEN' },
    });
  });
});
