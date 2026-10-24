import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { RegistrationSubmitPayload } from '@/components/registration/submit-registration';

type SentRequest = { body: Record<string, unknown>; idempotencyKey: string | null };

const PAYLOAD: RegistrationSubmitPayload = {
  firstName: 'Anna',
  lastName: 'Sargsyan',
  email: 'anna@example.com',
  phone: '99123456',
  phoneCountry: 'AM',
  privacyConsent: true,
  formVersion: 'test',
  answers: {},
  website: '',
};

const sent: SentRequest[] = [];

async function loadClient() {
  vi.resetModules();
  const [utm, submit, idempotency] = await Promise.all([
    import('@/components/registration/utm-attribution'),
    import('@/components/registration/submit-registration'),
    import('@/components/registration/idempotency'),
  ]);
  return { ...utm, ...submit, ...idempotency };
}

function land(search: string): void {
  window.history.replaceState(null, '', `/hy${search}`);
}

function utmOf(request: SentRequest | undefined): Record<string, unknown> {
  const body = request?.body ?? {};
  return {
    utmSource: body.utmSource,
    utmMedium: body.utmMedium,
    utmCampaign: body.utmCampaign,
  };
}

describe('registration submit carries landing UTM', () => {
  beforeEach(() => {
    sent.length = 0;
    localStorage.clear();
    sessionStorage.clear();
    vi.stubGlobal(
      'fetch',
      vi.fn(async (_url: string, init: RequestInit) => {
        const headers = new Headers(init.headers);
        sent.push({
          body: JSON.parse(String(init.body)) as Record<string, unknown>,
          idempotencyKey: headers.get('Idempotency-Key'),
        });
        return new Response(
          JSON.stringify({
            registrationId: `reg-${sent.length}`,
            ticketCode: 'TEABCDEFGHIJK',
            ticketViewToken: 'v'.repeat(32),
          }),
          { status: 201 },
        );
      }),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    window.history.replaceState(null, '', '/');
  });

  it('sends campaign names with + decoded to spaces and Unicode intact', async () => {
    const client = await loadClient();
    land('?utm_source=facebook&utm_medium=%D5%BE%D5%AB%D5%A4%D5%A5%D5%B8&utm_campaign=SP+Flexible');
    client.captureAndPersistUtmFromLocation();

    const result = await client.submitRegistration(PAYLOAD, 'hy', '');

    expect(result).toMatchObject({ ok: true, registrationId: 'reg-1' });
    expect(utmOf(sent[0])).toEqual({
      utmSource: 'facebook',
      utmMedium: 'վիդեո',
      utmCampaign: 'SP Flexible',
    });
  });

  it('keeps UTM for a second registration after returning to a clean /hy', async () => {
    const client = await loadClient();
    land('?utm_source=facebook&utm_campaign=tey26');
    client.captureAndPersistUtmFromLocation();
    await client.submitRegistration(PAYLOAD, 'hy', '');
    client.clearRegistrationIdempotencyKey();

    land('');
    client.captureAndPersistUtmFromLocation();
    await client.submitRegistration(PAYLOAD, 'hy', '');

    expect(utmOf(sent[1])).toEqual(utmOf(sent[0]));
    expect(sent[1]?.idempotencyKey).not.toBe(sent[0]?.idempotencyKey);
  });

  it('sends UTM read on this page when Web Storage is unavailable', async () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new DOMException('blocked', 'SecurityError');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('blocked', 'SecurityError');
    });
    const client = await loadClient();
    land('?utm_source=vk&utm_campaign=tey26');
    client.captureAndPersistUtmFromLocation();

    await client.submitRegistration(PAYLOAD, 'hy', '');

    expect(utmOf(sent[0])).toEqual({ utmSource: 'vk', utmMedium: undefined, utmCampaign: 'tey26' });
  });

  it('attributes to the latest campaign landing', async () => {
    const client = await loadClient();
    land('?utm_source=facebook&utm_medium=video&utm_campaign=old');
    client.captureAndPersistUtmFromLocation();
    land('?utm_source=google&utm_campaign=new');
    client.captureAndPersistUtmFromLocation();

    await client.submitRegistration(PAYLOAD, 'hy', '');

    expect(utmOf(sent[0])).toEqual({
      utmSource: 'google',
      utmMedium: undefined,
      utmCampaign: 'new',
    });
  });

  it('omits UTM keys for a direct visit', async () => {
    const client = await loadClient();
    land('');
    client.captureAndPersistUtmFromLocation();

    await client.submitRegistration(PAYLOAD, 'hy', '');

    expect(sent[0]?.body).not.toHaveProperty('utmSource');
    expect(sent[0]?.body).not.toHaveProperty('utmMedium');
    expect(sent[0]?.body).not.toHaveProperty('utmCampaign');
  });
});
