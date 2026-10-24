import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { completeRegistration } from '@/components/registration/complete-registration';
import { getOrCreateRegistrationIdempotencyKey } from '@/components/registration/idempotency';
import {
  resetTicketHandoffForTests,
  takeTicketHandoff,
} from '@/components/registration/ticket-handoff';
import {
  captureAndPersistUtmFromLocation,
  loadPersistedUtmAttribution,
} from '@/components/registration/utm-attribution';
import { consumeAnalyticsFormChannel } from '@/lib/analytics/form-channel-event';

const RESULT = {
  ok: true as const,
  registrationId: 'reg-42',
  ticketCode: 'TEABCDEFGHIJK',
  ticketViewToken: 'v'.repeat(32),
};

describe('completeRegistration', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    resetTicketHandoffForTests();
  });

  afterEach(() => {
    delete window.clarity;
    window.history.replaceState(null, '', '/');
  });

  it('keeps visit UTM but issues a new idempotency key', () => {
    window.history.replaceState(null, '', '/hy?utm_source=facebook&utm_campaign=SP+Flexible');
    captureAndPersistUtmFromLocation();
    const firstKey = getOrCreateRegistrationIdempotencyKey();

    completeRegistration(RESULT, 'general');

    expect(loadPersistedUtmAttribution()).toEqual({
      utmSource: 'facebook',
      utmCampaign: 'SP Flexible',
    });
    expect(getOrCreateRegistrationIdempotencyKey()).not.toBe(firstKey);
  });

  it('tags Clarity with the registration id only', () => {
    completeRegistration(RESULT, 'general');

    expect(window.clarity?.q).toEqual([['set', 'registration_id', 'reg-42']]);
  });

  it('hands off the ticket and form channel to the success page', () => {
    completeRegistration(RESULT, 'spyurk_rf');

    expect(takeTicketHandoff()).toEqual({
      ticketCode: RESULT.ticketCode,
      ticketViewToken: RESULT.ticketViewToken,
    });
    expect(consumeAnalyticsFormChannel()).toBe('spyurk_rf');
  });
});
