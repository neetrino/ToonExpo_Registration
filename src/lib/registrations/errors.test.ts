import { describe, expect, it } from 'vitest';
import { mapRegistrationError } from '@/lib/registrations/errors';

describe('mapRegistrationError', () => {
  it('maps idempotency unique races to IDEMPOTENT_REPLAY', () => {
    const error = {
      code: 'P2002',
      meta: { target: ['eventId', 'idempotencyKey'] },
    };
    expect(mapRegistrationError(error)).toEqual({
      code: 'IDEMPOTENT_REPLAY',
      httpStatus: 409,
    });
  });

  it('maps ticket code collisions for retry', () => {
    expect(
      mapRegistrationError({
        code: 'P2002',
        meta: { target: ['ticketCode'] },
      }),
    ).toEqual({
      code: 'TICKET_CODE_COLLISION',
      httpStatus: 503,
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
