import { describe, expect, it, vi } from 'vitest';
import {
  fetchMootqRegistrationSchema,
  mootqRegistrationSchemaUrl,
  type MootqSchemaFetch,
} from '@/lib/integrations/mootq/fetch-registration-schema';
import { buildMootqPushPayload } from '@/lib/integrations/mootq/push-payload';

const pushUrl = 'https://api.v3.mootq.com/api/v1/integrations/registrations';
const key = `mqi_${'k'.repeat(40)}`;
const params = { pushUrl, key, eventKey: 'toon-expo-2026' };

function identityQuestion(code: string, type: number) {
  return { code, type, required: true, config: null, options: [], visibility_rules: [] };
}

const schemaBody = {
  data: {
    eventKey: 'toon-expo-2026',
    schemaVersion: 11,
    submission: {
      identityAnswerCodes: {
        firstName: 'first_name',
        lastName: 'last_name',
        email: 'email',
        phone: 'phone',
      },
    },
    questions: [
      identityQuestion('first_name', 1),
      identityQuestion('last_name', 1),
      identityQuestion('phone', 10),
      identityQuestion('email', 2),
    ],
  },
};

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), { status });
}

describe('mootqRegistrationSchemaUrl', () => {
  it('points at the authenticated partner schema on the push host', () => {
    expect(mootqRegistrationSchemaUrl(pushUrl, 'toon-expo-2026')).toBe(
      'https://api.v3.mootq.com/api/v1/integrations/events/toon-expo-2026/registration-schema',
    );
  });
});

describe('fetchMootqRegistrationSchema', () => {
  it('sends the Bearer key and builds answers from the returned codes', async () => {
    const fetchImpl = vi.fn(async () => jsonResponse(200, schemaBody));
    const result = await fetchMootqRegistrationSchema({ ...params, fetchImpl });

    expect(fetchImpl).toHaveBeenCalledWith(
      mootqRegistrationSchemaUrl(pushUrl, 'toon-expo-2026'),
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${key}`,
          Accept: 'application/json',
          'Accept-Language': 'hy',
        },
        signal: expect.any(AbortSignal) as AbortSignal,
      },
    );
    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }

    const { payload, missingRequired } = buildMootqPushPayload(
      {
        sourceRegistrationId: 'reg_schema',
        ticketCode: 'TEABCDEFGHIJK',
        registeredAt: new Date('2026-10-09T09:00:00.000Z'),
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '+37499000001',
        locale: 'en',
      },
      result.schema,
    );
    expect(payload.eventKey).toBe('toon-expo-2026');
    expect(payload.answers).toEqual({
      first_name: 'John',
      last_name: 'Doe',
      phone: '+37499000001',
      email: 'john.doe@example.com',
    });
    expect(missingRequired).toEqual([]);
  });

  it('returns not ok when the schema request is rejected', async () => {
    const fetchImpl: MootqSchemaFetch = async () => jsonResponse(401, { message: 'Unauthorized' });
    await expect(fetchMootqRegistrationSchema({ ...params, fetchImpl })).resolves.toEqual({
      ok: false,
    });
  });

  it('returns not ok when the body is not a schema', async () => {
    const fetchImpl: MootqSchemaFetch = async () => jsonResponse(200, { data: { ok: true } });
    await expect(fetchMootqRegistrationSchema({ ...params, fetchImpl })).resolves.toEqual({
      ok: false,
    });
  });

  it('returns not ok when the request throws', async () => {
    const fetchImpl: MootqSchemaFetch = async () => {
      throw new Error('network');
    };
    await expect(fetchMootqRegistrationSchema({ ...params, fetchImpl })).resolves.toEqual({
      ok: false,
    });
  });
});
