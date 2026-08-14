import { describe, expect, it } from 'vitest';
import { ADMIN_TICKET_RESEND_COOLDOWN_MS } from '@/lib/admin/constants';
import {
  evaluateTicketResend,
  isTicketResendCoolingDown,
  type TicketResendRegistration,
} from '@/lib/admin/resend-ticket-guards';

const now = new Date('2026-08-14T10:00:00.000Z');

function registration(overrides: Partial<TicketResendRegistration> = {}): TicketResendRegistration {
  return {
    ticketCode: 'TEHV6TUGERFQB',
    ticketViewToken: 'token-abc',
    emailLastAttemptAt: new Date('2026-08-14T09:00:00.000Z'),
    deliveryJobs: [{ channel: 'EMAIL', status: 'SENT' }],
    ...overrides,
  };
}

describe('isTicketResendCoolingDown', () => {
  it('allows the first send when there is no previous attempt', () => {
    expect(isTicketResendCoolingDown(null, now)).toBe(false);
  });

  it('blocks another send inside the cooldown window', () => {
    const last = new Date(now.getTime() - ADMIN_TICKET_RESEND_COOLDOWN_MS + 1_000);
    expect(isTicketResendCoolingDown(last, now)).toBe(true);
  });

  it('allows a send after the cooldown window', () => {
    const last = new Date(now.getTime() - ADMIN_TICKET_RESEND_COOLDOWN_MS);
    expect(isTicketResendCoolingDown(last, now)).toBe(false);
  });
});

describe('evaluateTicketResend', () => {
  it('rejects when there is no active event', () => {
    expect(
      evaluateTicketResend({ hasActiveEvent: false, registration: registration(), now }),
    ).toEqual({
      ok: false,
      error: 'No active event.',
    });
  });

  it('rejects a missing registration', () => {
    expect(evaluateTicketResend({ hasActiveEvent: true, registration: null, now })).toEqual({
      ok: false,
      error: 'Registration not found.',
    });
  });

  it('rejects when the QR ticket is missing', () => {
    expect(
      evaluateTicketResend({
        hasActiveEvent: true,
        registration: registration({ ticketCode: null }),
        now,
      }),
    ).toEqual({ ok: false, error: 'This registration has no ticket to send.' });

    expect(
      evaluateTicketResend({
        hasActiveEvent: true,
        registration: registration({ ticketViewToken: null }),
        now,
      }),
    ).toEqual({ ok: false, error: 'This registration has no ticket to send.' });
  });

  it('rejects while a delivery job is processing', () => {
    expect(
      evaluateTicketResend({
        hasActiveEvent: true,
        registration: registration({
          deliveryJobs: [{ channel: 'EMAIL', status: 'PROCESSING' }],
        }),
        now,
      }),
    ).toEqual({ ok: false, error: 'Delivery is already in progress.' });
  });

  it('rejects inside the resend cooldown', () => {
    expect(
      evaluateTicketResend({
        hasActiveEvent: true,
        registration: registration({
          emailLastAttemptAt: new Date(now.getTime() - 10_000),
        }),
        now,
      }),
    ).toEqual({ ok: false, error: 'Wait a minute before sending again.' });
  });

  it('allows a resend of the same existing ticket', () => {
    expect(
      evaluateTicketResend({ hasActiveEvent: true, registration: registration(), now }),
    ).toEqual({
      ok: true,
    });
  });
});
