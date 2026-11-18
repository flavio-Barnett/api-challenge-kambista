import request from 'supertest';

import { startTestApp, type TestApp } from './support/test-app.js';
import { bearer, registerUser } from './support/users.js';

interface SessionBody {
  readonly refresh_token: string;
}

describe('Auth (e2e)', () => {
  let testApp: TestApp;

  async function startSession(email: string): Promise<SessionBody> {
    const response = await request(testApp.server)
      .post('/v1/auth/register')
      .send({ nombre: 'Sesión', email, password: 'Secreta123' })
      .expect(201);
    return response.body as SessionBody;
  }

  function refresh(refreshToken: string): request.Test {
    return request(testApp.server)
      .post('/v1/auth/refresh')
      .send({ refresh_token: refreshToken });
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
      'refresh_token',
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

  it('rotates the refresh token and rejects the used one', async () => {
    const session = await startSession('rotate@test.com');

    const rotated = await refresh(session.refresh_token).expect(200);
    const rotatedBody = rotated.body as SessionBody;

    await refresh(rotatedBody.refresh_token).expect(200);
    await refresh(session.refresh_token).expect(401);
  });

  it('revokes the refresh token on logout', async () => {
    const session = await startSession('logout@test.com');

    await request(testApp.server)
      .post('/v1/auth/logout')
      .send({ refresh_token: session.refresh_token })
      .expect(204);

    await refresh(session.refresh_token).expect(401);
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
