import { Types } from 'mongoose';

import { User } from '../../domain/entities/user.entity.js';
import { Email } from '../../domain/value-objects/email.vo.js';
import { toUser, toUserDocument } from './user.mapper.js';

describe('user mapper', () => {
  it('maps a new user to a document and back', () => {
    const document = toUserDocument(
      User.prepareRegistration('Ana', Email.create('ana@kambista.com'), 'hash'),
    );
    const id = new Types.ObjectId();

    const user = toUser({ _id: id, ...document });

    expect(document).toEqual({
      name: 'Ana',
      email: 'ana@kambista.com',
      passwordHash: 'hash',
      role: 'user',
    });
    expect(user.id).toBe(id.toHexString());
    expect(user.email.value).toBe('ana@kambista.com');
  });
});
