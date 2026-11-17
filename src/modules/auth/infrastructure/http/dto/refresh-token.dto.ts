import { IsString, MaxLength, MinLength } from 'class-validator';

export class RefreshTokenDto {
  @MaxLength(512, { message: 'El refresh token no es válido' })
  @MinLength(1, { message: 'El refresh token es obligatorio' })
  @IsString({ message: 'El refresh token es obligatorio' })
  refresh_token: string;
}
