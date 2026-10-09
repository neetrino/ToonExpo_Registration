import { describe, expect, it, afterEach, vi } from 'vitest';
import { executeMootqPushRequest } from '@/lib/integrations/mootq/push-client';
import { FORM_VERSION } from '@/lib/questionnaire/constants';
import {
  buildMootqPushPayload,
  type BuildMootqPushPayloadInput,
  type MootqPushPayload,
} from '@/lib/integrations/mootq/push-payload';
import {
  Q,
  fixtureQuestion,
  mootqSchemaFixture,
} from '@/lib/integrations/mootq/registration-schema.fixture';

const registeredAt = new Date('2026-07-27T12:00:00.000Z');

const fullPushInput = {
  sourceRegistrationId: 'reg_abc',
  ticketCode: 'TEABCDEFGHIJK',
  registeredAt,
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  phone: '+37499000001',
  locale: 'hy' as const,
};

function payloadFor(input: BuildMootqPushPayloadInput): MootqPushPayload {
  return buildMootqPushPayload(input, mootqSchemaFixture).payload;
}

describe('buildMootqPushPayload', () => {
  it('sends the Partner Registration envelope with flat coded answers', () => {
    const payload = payloadFor({
      ...fullPushInput,
      utmSource: 'facebook',
      utmMedium: null,
      utmCampaign: 'expo',
    });

    expect(payload).toEqual({
      eventKey: 'toon-expo-2026',
      sourceRegistrationId: 'reg_abc',
      ticketCode: 'TEABCDEFGHIJK',
      registeredAt: '2026-07-27T12:00:00.000Z',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '+37499000001',
      locale: 'hy',
      answers: {
        first_name: 'John',
        last_name: 'Doe',
        phone: '+37499000001',
        email: 'john.doe@example.com',
      },
      utmSource: 'facebook',
      utmCampaign: 'expo',
    });
  });

  it('places identity under the codes the schema names', () => {
    const schema = {
      ...mootqSchemaFixture,
      identityAnswerCodes: { firstName: 'given_name' },
      questions: [
        { ...fixtureQuestion(Q.firstName), code: 'given_name' },
        ...mootqSchemaFixture.questions.filter((item) => item.code !== Q.firstName),
      ],
    };
    const { payload } = buildMootqPushPayload(fullPushInput, schema);
    expect(payload.answers.given_name).toBe('John');
  });

  it('reports visible required questions that have no answer', () => {
    const { missingRequired } = buildMootqPushPayload(fullPushInput, mootqSchemaFixture);
    expect(missingRequired).toContain(Q.ageBand);
    expect(missingRequired).not.toContain(Q.residenceYerevan);
  });

  it('maps the confirmed market-research example to question codes', () => {
    const payload = payloadFor(
      {
        ...fullPushInput,
        formVersion: FORM_VERSION,
        answers: {
          ageBand: '25-34',
          residence: { scope: 'yerevan', district: 'kentron' },
          visitPurpose: 'market_research',
          marketInterests: ['new_apartments'],
          researchGoal: 'future_purchase',
          researchLocation: {
            undecided: false,
            yerevanDistricts: ['kentron'],
            marzRegions: [],
          },
          purchaseHorizon: 'up_to_3_months',
          newsletter: false,
        },
      },
    );

    expect(payload.answers).toMatchObject({
      [Q.ageBand]: '25-34 տարեկան',
      [Q.residenceScope]: 'Երևան',
      [Q.residenceYerevan]: 'Կենտրոն',
      [Q.visitPurpose]: 'Շուկայի ուսումնասիրություն և ծանոթացում',
      [Q.marketInterests]: ['Նորակառույց բնակարաններ'],
      [Q.researchGoal]: 'Ապագա բնակարան գնելու համար',
      [Q.researchLocationScope]: 'Երևան',
      [Q.researchYerevan]: ['Կենտրոն'],
      [Q.purchaseHorizon]: 'Մինչև 3 ամսվա ընթացքում',
      [Q.newsletter]: 'Ոչ',
    });
  });

  it('sends shared answers for other branches and does not invent question codes', () => {
    const payload = payloadFor(
      {
        ...fullPushInput,
        formVersion: FORM_VERSION,
        answers: {
          ageBand: '25-34',
          residence: { scope: 'abroad', country: 'Georgia' },
          visitPurpose: 'investment',
          investmentPropertyType: 'apartment',
          locationSeek: {
            yerevanDistricts: ['kentron'],
            marzRegions: [],
            abroadCountries: [],
          },
          investmentGoal: 'rental_income',
          areaSqm: '50-70',
          purchaseMethod: 'cash',
          investmentTimeline: 'up_to_3_months',
          investmentBudgetUsd: 'up_to_150k',
          priorInvestmentExperience: 'no_first',
        },
      },
    );

    expect(payload.answers[Q.visitPurpose]).toBe('Հետաքրքրված եմ ներդրումներով');
    expect(payload.answers[Q.residenceScope]).toBe('Արտերկիր');
    expect(payload.answers[Q.residenceAbroad]).toBe('Georgia');
    expect(payload.answers[Q.investmentPropertyType]).toBe('Բնակարան');
    expect(payload.answers).not.toHaveProperty(Q.marketInterests);
    expect(payload.answers).not.toHaveProperty(Q.researchGoal);
  });
});

describe('executeMootqPushRequest', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  const baseParams = {
    url: 'https://mootq.example/push',
    key: 'k'.repeat(32),
    registrationId: 'reg_abc',
    payload: payloadFor(fullPushInput),
  };

  it('sends Authorization, Idempotency-Key, and the registration envelope', async () => {
    const fetchImpl = vi.fn(async (_input: string | URL | Request, init?: RequestInit) => {
      expect(init?.method).toBe('POST');
      expect(init?.headers).toMatchObject({
        Authorization: `Bearer ${baseParams.key}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'Idempotency-Key': 'reg_abc',
      });
      const body = JSON.parse(String(init?.body)) as Record<string, unknown>;
      expect(body).toEqual(baseParams.payload);
      expect(body.eventKey).toBe('toon-expo-2026');
      expect(body.sourceRegistrationId).toBe('reg_abc');
      expect(body).not.toHaveProperty('event_id');
      expect(body).not.toHaveProperty('buyer');
      return new Response(null, { status: 204 });
    });

    const result = await executeMootqPushRequest({ ...baseParams, fetchImpl });
    expect(result).toEqual({ ok: true });
    expect(fetchImpl).toHaveBeenCalledOnce();
  });

  it('maps timeout to retryable failure', async () => {
    const fetchImpl = vi.fn(async (_input: string | URL | Request, init?: RequestInit) => {
      const error = new Error('Aborted');
      error.name = 'AbortError';
      void init?.signal;
      throw error;
    });

    const result = await executeMootqPushRequest({
      ...baseParams,
      fetchImpl,
      timeoutMs: 5,
    });
    expect(result).toEqual({ ok: false, reason: 'timeout', retryable: true });
  });

  it('maps 429 to retryable with Retry-After, and 409/422 to permanent', async () => {
    const retryResult = await executeMootqPushRequest({
      ...baseParams,
      fetchImpl: vi.fn(
        async () => new Response(null, { status: 429, headers: { 'Retry-After': '120' } }),
      ),
    });
    expect(retryResult).toEqual({
      ok: false,
      reason: 'http_429',
      retryable: true,
      retryAfterSeconds: 120,
    });

    for (const status of [409, 422]) {
      const permanentResult = await executeMootqPushRequest({
        ...baseParams,
        fetchImpl: vi.fn(async () => new Response('{"message":"Rejected"}', { status })),
      });
      expect(permanentResult).toEqual({ ok: false, reason: `http_${status}`, retryable: false });
    }
  });
});
