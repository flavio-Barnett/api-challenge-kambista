import type { Role } from '../../../../../shared/domain/role.type.js';
import type { User } from '../../../domain/entities/user.entity.js';

export class UsuarioDto {
  id: string;
  nombre: string;
  email: string;
  rol: Role;

  static fromUser(user: User): UsuarioDto {
    return {
      id: user.id,
      nombre: user.name,
      email: user.email.value,
      rol: user.role,
    };
  }
}
