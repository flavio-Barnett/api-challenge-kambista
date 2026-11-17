import { IsByteLength, IsEmail, IsString, MaxLength } from 'class-validator';

export class LogInDto {
  @MaxLength(254, { message: 'El email es demasiado largo' })
  @IsEmail({}, { message: 'El email no es válido' })
  email: string;

  @IsByteLength(1, 72, { message: 'La contraseña es obligatoria' })
  @IsString({ message: 'La contraseña es obligatoria' })
  password: string;
}
