import { describe, expect, it } from 'vitest';
import {
  TICKET_SMS_DELIVERY_ENABLED,
  isTicketSmsDeliveryEnabled,
} from '@/lib/delivery/ticket-sms-policy';

describe('ticket SMS policy', () => {
  it('keeps ticket QR SMS paused', () => {
    expect(TICKET_SMS_DELIVERY_ENABLED).toBe(false);
    expect(isTicketSmsDeliveryEnabled()).toBe(false);
  });
});
