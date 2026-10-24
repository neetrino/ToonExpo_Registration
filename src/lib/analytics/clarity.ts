export const CLARITY_REGISTRATION_ID_TAG = 'registration_id';

type ClarityQueue = NonNullable<Window['clarity']>;

/**
 * Tag the current Microsoft Clarity session with the created registration id so the
 * recording can be found by id. Clarity is loaded via GTM and may not be ready yet;
 * calls are queued with Clarity's official stub and replayed when it loads.
 * Never pass personal data (name, phone, email, ticket links) here.
 */
export function tagClarityRegistration(registrationId: string): void {
  if (typeof window === 'undefined' || !registrationId) {
    return;
  }

  if (typeof window.clarity !== 'function') {
    const stub: ClarityQueue = (...args: unknown[]) => {
      (stub.q = stub.q ?? []).push(args);
    };
    window.clarity = stub;
  }

  window.clarity('set', CLARITY_REGISTRATION_ID_TAG, registrationId);
}
