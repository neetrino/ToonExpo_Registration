import { ADMIN_TICKET_RESEND_COOLDOWN_MS } from '@/lib/admin/constants';

export type TicketResendJob = {
  channel: 'EMAIL' | 'SMS';
  status: 'PENDING' | 'PROCESSING' | 'SENT' | 'FAILED';
};

export type TicketResendRegistration = {
  ticketCode: string | null;
  ticketViewToken: string | null;
  emailLastAttemptAt: Date | null;
  deliveryJobs: TicketResendJob[];
};

export type TicketResendGuardResult = { ok: true } | { ok: false; error: string };

export function isTicketResendCoolingDown(lastAttemptAt: Date | null, now: Date): boolean {
  if (!lastAttemptAt) {
    return false;
  }

  return now.getTime() - lastAttemptAt.getTime() < ADMIN_TICKET_RESEND_COOLDOWN_MS;
}

/**
 * Decide whether an admin QR resend is allowed. Does not send or mutate data.
 */
export function evaluateTicketResend(input: {
  hasActiveEvent: boolean;
  registration: TicketResendRegistration | null;
  now: Date;
}): TicketResendGuardResult {
  if (!input.hasActiveEvent) {
    return { ok: false, error: 'No active event.' };
  }

  if (!input.registration) {
    return { ok: false, error: 'Registration not found.' };
  }

  if (!input.registration.ticketCode || !input.registration.ticketViewToken) {
    return { ok: false, error: 'This registration has no ticket to send.' };
  }

  if (input.registration.deliveryJobs.some((job) => job.status === 'PROCESSING')) {
    return { ok: false, error: 'Delivery is already in progress.' };
  }

  if (isTicketResendCoolingDown(input.registration.emailLastAttemptAt, input.now)) {
    return { ok: false, error: 'Wait a minute before sending again.' };
  }

  return { ok: true };
}
