import type { Server } from 'node:http';

import request from 'supertest';

import { PromoteUserToAdminUseCase } from '../../src/modules/auth/application/use-cases/promote-user-to-admin.use-case.js';
import type { TestApp } from './test-app.js';

const PASSWORD = 'Secreta123';

export interface TestUser {
  readonly id: string;
  readonly email: string;
  readonly token: string;
}

interface SessionBody {
  readonly access_token: string;
  readonly usuario: { readonly id: string };
}

function toUser(email: string, body: SessionBody): TestUser {
  return { id: body.usuario.id, email, token: body.access_token };
}

export async function registerUser(
  server: Server,
  email: string,
): Promise<TestUser> {
  const response = await request(server)
    .post('/v1/auth/register')
    .send({ nombre: 'Usuario de prueba', email, password: PASSWORD })
    .expect(201);
  return toUser(email, response.body as SessionBody);
}

export async function registerAdmin(
  testApp: TestApp,
  email: string,
): Promise<TestUser> {
  await registerUser(testApp.server, email);
  await testApp.get(PromoteUserToAdminUseCase).execute(email);
  const response = await request(testApp.server)
    .post('/v1/auth/login')
    .send({ email, password: PASSWORD })
    .expect(200);
  return toUser(email, response.body as SessionBody);
}

export function bearer(user: TestUser): string {
  return `Bearer ${user.token}`;
}
