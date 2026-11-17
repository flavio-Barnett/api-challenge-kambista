import type { ValidationError } from 'class-validator';
import { RequestValidationError } from './request-validation.error.js';

describe('RequestValidationError', () => {
  it('flattens constraints from nested properties', () => {
    const errors: ValidationError[] = [
      {
        property: 'email',
        constraints: { isEmail: 'email must be an email' },
        children: [],
      },
      {
        property: 'profile',
        children: [
          {
            property: 'name',
            constraints: { isNotEmpty: 'name should not be empty' },
            children: [],
          },
        ],
      },
    ];

    const error = new RequestValidationError(errors);

    expect(error.code).toBe('VALIDATION_ERROR');
    expect(error.kind).toBe('validation');
    expect(error.message).toBe(
      'email must be an email; name should not be empty',
    );
  });
});
