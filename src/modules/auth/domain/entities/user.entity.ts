import { InvalidUserNameError } from '../auth.errors.js';
import type { Email } from '../value-objects/email.vo.js';
import { DEFAULT_ROLE, type Role } from '../value-objects/role.vo.js';

export interface UserProps {
  readonly id: string;
  readonly name: string;
  readonly email: Email;
  readonly passwordHash: string;
  readonly role: Role;
}

export type NewUser = Omit<UserProps, 'id'>;

const NAME_MIN_LENGTH = 2;
const NAME_MAX_LENGTH = 80;

function normalizeName(raw: string): string {
  const name = raw.trim();
  if (name.length < NAME_MIN_LENGTH || name.length > NAME_MAX_LENGTH) {
    throw new InvalidUserNameError();
  }
  return name;
}

export class User {
  private constructor(private readonly props: UserProps) {}

  static restore(props: UserProps): User {
    return new User(props);
  }

  static prepareRegistration(
    name: string,
    email: Email,
    passwordHash: string,
  ): NewUser {
    return {
      name: normalizeName(name),
      email,
      passwordHash,
      role: DEFAULT_ROLE,
    };
  }

  get id(): string {
    return this.props.id;
  }

  get name(): string {
    return this.props.name;
  }

  get email(): Email {
    return this.props.email;
  }

  get passwordHash(): string {
    return this.props.passwordHash;
  }

  get role(): Role {
    return this.props.role;
  }

  isAdmin(): boolean {
    return this.props.role === 'admin';
  }

  promoteToAdmin(): User {
    return new User({ ...this.props, role: 'admin' });
  }
}
