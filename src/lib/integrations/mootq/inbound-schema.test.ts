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
  registeredAt: '2026-07-27T10:15:00.000Z',
};

describe('mootqInboundBodySchema', () => {
  it('accepts a valid inbound payload', () => {
    const parsed = mootqInboundBodySchema.safeParse(validBody);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.ticketCode).toBe('MQ8D6N4T7C2X9');
      expect(parsed.data.phoneNormalized).toBe('+37499123456');
      expect(parsed.data.emailNormalized).toBe('visitor@example.com');
      expect(parsed.data.locale).toBe('hy');
      expect(parsed.data.registeredAt.toISOString()).toBe('2026-07-27T10:15:00.000Z');
      expect(parsed.data.answers).toBeUndefined();
    }
  });

  it('requires locale and registeredAt', () => {
    expect(mootqInboundBodySchema.safeParse({ ...validBody, locale: undefined }).success).toBe(
      false,
    );
    const withoutRegisteredAt = { ...validBody } as Record<string, unknown>;
    delete withoutRegisteredAt.registeredAt;
    expect(mootqInboundBodySchema.safeParse(withoutRegisteredAt).success).toBe(false);
  });

  it('keeps unknown answers keys and drops nested objects', () => {
    const parsed = mootqInboundBodySchema.safeParse({
      ...validBody,
      answers: {
        company: 'Example LLC',
        job_title: 'Founder',
        nested: { ignored: true },
        interests: ['animation'],
      },
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.answers).toEqual({
        company: 'Example LLC',
        job_title: 'Founder',
        interests: ['animation'],
      });
    }
  });

  it('rejects answers that are not an object', () => {
    expect(
      mootqInboundBodySchema.safeParse({
        ...validBody,
        answers: ['not', 'an', 'object'],
      }).success,
    ).toBe(false);
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

  it('accepts a rehearsal payload with eventKey and partner answers', () => {
    const parsed = mootqInboundBodySchema.safeParse({
      eventKey: 'toon-expo-2026',
      sourceRegistrationId: 'mq-rehearsal-1',
      ticketCode: 'MQ7K4M2X9P3R8',
      registeredAt: '2026-09-24T10:15:30.000000Z',
      firstName: 'Փորձ',
      lastName: 'Այցելու',
      email: 'Visitor.Test@Example.com',
      phone: '+374 99 123456',
      locale: 'hy',
      sourceSystem: 'MOOTQ',
      answers: {
        field_1788873742063: '25-34',
        company: null,
        nested: { ignored: true },
      },
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.ticketCode).toBe('MQ7K4M2X9P3R8');
      expect(parsed.data.emailNormalized).toBe('visitor.test@example.com');
      expect(parsed.data.phoneNormalized).toBe('+37499123456');
      expect(parsed.data.answers).toEqual({
        field_1788873742063: '25-34',
        company: null,
      });
    }
  });

  it('ignores partner extras such as eventKey and sourceSystem', () => {
    const parsed = mootqInboundBodySchema.safeParse({
      ...validBody,
      eventKey: 'toon-expo-2026',
      sourceSystem: 'TOON_EXPO',
      utmSource: 'partner-test',
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.ticketCode).toBe('MQ8D6N4T7C2X9');
      expect(parsed.data).not.toHaveProperty('eventKey');
      expect(parsed.data).not.toHaveProperty('sourceSystem');
    }
  });
});
