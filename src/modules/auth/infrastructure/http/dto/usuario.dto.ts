import type { User } from '../../../domain/entities/user.entity.js';
import type { Role } from '../../../domain/value-objects/role.vo.js';

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
