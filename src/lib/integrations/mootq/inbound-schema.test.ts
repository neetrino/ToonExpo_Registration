import { describe, expect, it } from 'vitest';
import { mootqInboundBodySchema } from '@/lib/integrations/mootq/inbound-schema';

const validBody = {
  sourceRegistrationId: 'mq-98231',
  ticketCode: 'MQ8D6N4T7C2X9',
  firstName: 'Example',
  lastName: 'Visitor',
  email: 'visitor@example.com',
  phone: '+37499123456',
  locale: 'hy',
  createdAt: '2026-07-27T10:15:00.000Z',
};

describe('mootqInboundBodySchema', () => {
  it('accepts a valid minimal inbound payload', () => {
    const parsed = mootqInboundBodySchema.safeParse(validBody);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.ticketCode).toBe('MQ8D6N4T7C2X9');
      expect(parsed.data.phoneNormalized).toBe('+37499123456');
      expect(parsed.data.emailNormalized).toBe('visitor@example.com');
    }
  });

  it('rejects non-MQ, separator, or short ticket codes', () => {
    expect(
      mootqInboundBodySchema.safeParse({
        ...validBody,
        ticketCode: 'TE8D6N4T7C2X9',
      }).success,
    ).toBe(false);
    expect(
      mootqInboundBodySchema.safeParse({
        ...validBody,
        ticketCode: 'TE-8D6N4T7C2X9',
      }).success,
    ).toBe(false);
    expect(
      mootqInboundBodySchema.safeParse({
        ...validBody,
        ticketCode: 'short',
      }).success,
    ).toBe(false);
  });

  it('rejects sourceSystem overrides via strict schema', () => {
    const parsed = mootqInboundBodySchema.safeParse({
      ...validBody,
      sourceSystem: 'TOON_EXPO',
    });
    expect(parsed.success).toBe(false);
  });
});
