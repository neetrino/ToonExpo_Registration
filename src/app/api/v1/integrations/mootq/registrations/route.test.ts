import { beforeEach, describe, expect, it, vi } from 'vitest';

const authenticateMootqRequest = vi.hoisted(() => vi.fn());
const importMootqRegistration = vi.hoisted(() => vi.fn());

vi.mock('@/lib/integrations/mootq/auth', () => ({ authenticateMootqRequest }));
vi.mock('@/lib/integrations/mootq/import-registration', () => ({ importMootqRegistration }));

import { POST } from '@/app/api/v1/integrations/mootq/registrations/route';

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

function inboundRequest(body: unknown): Request {
  return new Request('https://reg.toonexpo.com/api/v1/integrations/mootq/registrations', {
    method: 'POST',
    headers: {
      authorization: 'Bearer test-write-key-with-32-characters',
      'content-type': 'application/json',
    },
    body: JSON.stringify(body),
  });
}

describe('POST /api/v1/integrations/mootq/registrations locale', () => {
  beforeEach(() => {
    authenticateMootqRequest.mockReset();
    importMootqRegistration.mockReset();
    authenticateMootqRequest.mockReturnValue({ ok: true });
    importMootqRegistration.mockResolvedValue({ ok: true, kind: 'created' });
  });

  it.each([
    ['hy', 'hy'],
    ['en', 'en'],
    ['ru', 'ru'],
    ['HY', 'hy'],
    ['hy-AM', 'hy'],
    ['en_US', 'en'],
    ['ru-RU', 'ru'],
    ['am', 'hy'],
    ['հայերեն', 'hy'],
    ['english', 'en'],
    ['русский', 'ru'],
  ])('accepts locale %j and stores %s', async (locale, stored) => {
    const response = await POST(inboundRequest({ ...validBody, locale }));

    expect(response.status).toBe(204);
    expect(importMootqRegistration).toHaveBeenCalledTimes(1);
    expect(importMootqRegistration.mock.calls[0]?.[0].locale).toBe(stored);
  });

  it.each([undefined, null, '', 'fr', 'am-ET', 1])(
    'returns the partner 400 when locale is %j',
    async (locale) => {
      const response = await POST(inboundRequest({ ...validBody, locale }));
      const body: unknown = await response.json();

      expect(response.status).toBe(400);
      expect(body).toMatchObject({
        ok: false,
        code: 'VALIDATION_ERROR',
        fields: ['locale'],
      });
      expect(importMootqRegistration).not.toHaveBeenCalled();
    },
  );

  it('rejects a missing locale with the same 400 shape', async () => {
    const withoutLocale: Record<string, unknown> = { ...validBody };
    delete withoutLocale.locale;
    const response = await POST(inboundRequest(withoutLocale));
    const body: unknown = await response.json();

    expect(response.status).toBe(400);
    expect(body).toMatchObject({
      ok: false,
      code: 'VALIDATION_ERROR',
      fields: ['locale'],
    });
    expect(importMootqRegistration).not.toHaveBeenCalled();
  });

  it('still rejects an invalid phone after a usable locale', async () => {
    const response = await POST(
      inboundRequest({ ...validBody, locale: 'hy-AM', phone: 'not-a-phone' }),
    );
    const body: unknown = await response.json();

    expect(response.status).toBe(400);
    expect(body).toMatchObject({
      ok: false,
      code: 'VALIDATION_ERROR',
      fields: ['phone'],
    });
    expect(importMootqRegistration).not.toHaveBeenCalled();
  });

  it('does not import when the write credential is rejected', async () => {
    authenticateMootqRequest.mockReturnValue({
      ok: false,
      status: 401,
      code: 'UNAUTHORIZED',
    });

    const response = await POST(inboundRequest({ ...validBody, locale: 'hy-AM' }));
    const body: unknown = await response.json();

    expect(response.status).toBe(401);
    expect(body).toMatchObject({ ok: false, code: 'UNAUTHORIZED' });
    expect(importMootqRegistration).not.toHaveBeenCalled();
  });
});
