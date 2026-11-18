import { NestFactory } from '@nestjs/core';

import { PromoteUserToAdminUseCase } from '../../application/use-cases/promote-user-to-admin.use-case.js';
import { PromoteUserCliModule } from './promote-user-cli.module.js';

function fail(message: string): void {
  process.stderr.write(`${message}\n`);
  process.exitCode = 1;
}

async function promote(email: string | undefined): Promise<void> {
  if (!email) {
    fail('Uso: npm run user:promote -- <email>');
    return;
  }
  const app = await NestFactory.createApplicationContext(PromoteUserCliModule, {
    logger: false,
  });
  try {
    const user = await app.get(PromoteUserToAdminUseCase).execute(email);
    process.stdout.write(`${user.email.value} ahora tiene rol admin\n`);
  } catch (error) {
    fail(error instanceof Error ? error.message : String(error));
  } finally {
    await app.close();
  }
}

await promote(process.argv[2]);
