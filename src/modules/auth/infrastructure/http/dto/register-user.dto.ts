import { IsByteLength, IsEmail, IsString, MaxLength } from 'class-validator';

export class RegisterUserDto {
  @MaxLength(80, { message: 'El nombre debe tener como máximo 80 caracteres' })
  @IsString({ message: 'El nombre es obligatorio' })
  nombre: string;

  @MaxLength(254, { message: 'El email es demasiado largo' })
  @IsEmail({}, { message: 'El email no es válido' })
  email: string;

  @IsByteLength(8, 72, {
    message: 'La contraseña debe tener entre 8 y 72 caracteres',
  })
  @IsString({ message: 'La contraseña es obligatoria' })
  password: string;
}
