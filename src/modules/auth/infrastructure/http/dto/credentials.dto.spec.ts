import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import { LogInDto } from './log-in.dto.js';
import { RegisterUserDto } from './register-user.dto.js';

async function passwordErrors(
  dtoClass: typeof LogInDto | typeof RegisterUserDto,
  password: string,
): Promise<number> {
  const dto = plainToInstance(dtoClass, {
    nombre: 'Ana',
    email: 'ana@kambista.com',
    password,
  });
  const errors = await validate(dto);
  return errors.filter((error) => error.property === 'password').length;
}

describe('password validation', () => {
  it('lets login accept any non-empty password so wrong ones get 401', async () => {
    await expect(passwordErrors(LogInDto, '123')).resolves.toBe(0);
  });

  it.each(['', 'x'.repeat(73)])(
    'rejects the login password %j',
    async (password) => {
      await expect(passwordErrors(LogInDto, password)).resolves.toBe(1);
    },
  );

  it('requires at least 8 characters when registering', async () => {
    await expect(passwordErrors(RegisterUserDto, '1234567')).resolves.toBe(1);
    await expect(passwordErrors(RegisterUserDto, '12345678')).resolves.toBe(0);
  });

  it('measures the 72 limit in bytes, as bcrypt does', async () => {
    await expect(passwordErrors(RegisterUserDto, 'ñ'.repeat(37))).resolves.toBe(
      1,
    );
  });
});
