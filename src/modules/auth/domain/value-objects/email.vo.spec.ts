import { InvalidEmailError } from '../auth.errors.js';
import { Email } from './email.vo.js';

describe('Email', () => {
  it('normalizes casing and surrounding whitespace', () => {
    expect(Email.create('  Ana.Perez@Kambista.COM ').value).toBe(
      'ana.perez@kambista.com',
    );
  });

  it('considers emails with different casing equal', () => {
    expect(Email.create('a@b.pe').equals(Email.create('A@B.PE'))).toBe(true);
  });

  it.each(['', 'ana', 'ana@', '@kambista.com', 'ana perez@kambista.com'])(
    'rejects %j',
    (raw) => {
      expect(() => Email.create(raw)).toThrow(InvalidEmailError);
    },
  );
});
