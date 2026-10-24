import { afterEach, describe, expect, it, vi } from 'vitest';
import { CLARITY_REGISTRATION_ID_TAG, tagClarityRegistration } from '@/lib/analytics/clarity';

describe('tagClarityRegistration', () => {
  afterEach(() => {
    delete window.clarity;
  });

  it('sets the registration_id custom tag when Clarity is loaded', () => {
    const clarity = vi.fn();
    window.clarity = clarity;

    tagClarityRegistration('reg-123');

    expect(clarity).toHaveBeenCalledWith('set', CLARITY_REGISTRATION_ID_TAG, 'reg-123');
  });

  it('queues the tag until Clarity loads', () => {
    tagClarityRegistration('reg-123');

    expect(window.clarity?.q).toEqual([['set', 'registration_id', 'reg-123']]);
  });

  it('does nothing without an id', () => {
    tagClarityRegistration('');

    expect(window.clarity).toBeUndefined();
  });
});
