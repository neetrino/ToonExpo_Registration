import { describe, expect, it, vi } from 'vitest';
import { buildMootqPushPayload } from '@/lib/integrations/mootq/push-payload';
import {
  fetchMootqRegistrationSchema,
  mootqRegistrationSchemaUrl,
} from '@/lib/integrations/mootq/fetch-registration-schema';
import type { MootqSchemaFetch } from '@/lib/integrations/mootq/fetch-registration-schema';

const schemaBody = {
  per_user: [
    {
      id: 901,
      code: 'first_name',
      type: 1,
      options: [],
      visibility_rules: [],
    },
    {
      id: 902,
      code: 'last_name',
      type: 1,
      options: [],
      visibility_rules: [],
    },
    {
      id: 903,
      code: 'phone',
      type: 10,
      options: [],
      visibility_rules: [],
    },
    {
      id: 904,
      code: 'email',
      type: 2,
      options: [],
      visibility_rules: [],
    },
  ],
  per_order: [],
  per_ticket: [],
};

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), { status });
}

describe('mootqRegistrationSchemaUrl', () => {
  it('matches the partner catalog URL', () => {
    expect(mootqRegistrationSchemaUrl()).toBe(
      'https://api.v3.mootq.com/api/events/toon-expo-2026/registration-schema?items[]=56:1',
    );
  });
});

describe('fetchMootqRegistrationSchema', () => {
  it('requests the catalog in Armenian and uses the returned question ids', async () => {
    const fetchImpl = vi.fn(async () => jsonResponse(200, schemaBody));
    const result = await fetchMootqRegistrationSchema({ fetchImpl });

    expect(fetchImpl).toHaveBeenCalledWith(mootqRegistrationSchemaUrl(), {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Accept-Language': 'hy',
      },
      signal: expect.any(AbortSignal) as AbortSignal,
    });
    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }

    const payload = buildMootqPushPayload(
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
    expect(payload.answers.per_user).toMatchObject({
      '901': 'John',
      '902': 'Doe',
      '903': '+37499000001',
      '904': 'john.doe@example.com',
    });
  });

  it('returns not ok when the catalog request fails', async () => {
    const fetchImpl: MootqSchemaFetch = async () => jsonResponse(401, { code: 'UNAUTHORIZED' });
    await expect(fetchMootqRegistrationSchema({ fetchImpl })).resolves.toEqual({ ok: false });
  });

  it('returns not ok when the body is not a schema', async () => {
    const fetchImpl: MootqSchemaFetch = async () => jsonResponse(200, { ok: true });
    await expect(fetchMootqRegistrationSchema({ fetchImpl })).resolves.toEqual({ ok: false });
  });

  it('returns not ok when the request throws', async () => {
    const fetchImpl: MootqSchemaFetch = async () => {
      throw new Error('network');
    };
    await expect(fetchMootqRegistrationSchema({ fetchImpl })).resolves.toEqual({ ok: false });
  });
});
