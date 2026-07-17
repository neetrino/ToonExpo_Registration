import { describe, expect, it } from 'vitest';
import { mapRegistrationError } from '@/lib/registrations/errors';

describe('mapRegistrationError', () => {
  it('maps unique constraint races to 409 DUPLICATE_EMAIL', () => {
    const error = {
      code: 'P2002',
      meta: { target: ['eventId', 'emailNormalized'] },
    };
    expect(mapRegistrationError(error)).toEqual({
      code: 'DUPLICATE_EMAIL',
      httpStatus: 409,
    });
  });

  it('maps connection failures to 503', () => {
    expect(mapRegistrationError({ code: 'P1001' })).toEqual({
      code: 'SERVICE_UNAVAILABLE',
      httpStatus: 503,
    });
  });

  it('maps unknown errors to 500', () => {
    expect(mapRegistrationError(new Error('boom'))).toEqual({
      code: 'INTERNAL_ERROR',
      httpStatus: 500,
    });
  });
});
