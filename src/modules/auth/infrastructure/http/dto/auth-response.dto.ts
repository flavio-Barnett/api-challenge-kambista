import type { AuthSession } from '../../../application/services/session-issuer.service.js';
import { UsuarioDto } from './usuario.dto.js';

export class AuthResponseDto {
  access_token: string;
  refresh_token: string;
  usuario: UsuarioDto;

  static fromSession(session: AuthSession): AuthResponseDto {
    return {
      access_token: session.accessToken,
      refresh_token: session.refreshToken,
      usuario: UsuarioDto.fromUser(session.user),
    };
  }
}
