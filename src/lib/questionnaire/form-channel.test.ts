import { describe, expect, it } from 'vitest';
import { FORM_VERSION } from '@/lib/questionnaire/constants';
import { SPYURK_FORM_VERSION } from '@/lib/questionnaire/spyurk/constants';
import { formChannelFromVersion, isSpyurkFormVersion } from '@/lib/questionnaire/form-channel';

describe('formChannelFromVersion', () => {
  it('maps Spyurk and general versions without accepting a client channel', () => {
    expect(formChannelFromVersion(SPYURK_FORM_VERSION)).toBe('SPYURK_RF');
    expect(formChannelFromVersion(FORM_VERSION)).toBe('GENERAL');
    expect(formChannelFromVersion('legacy')).toBe('GENERAL');
    expect(isSpyurkFormVersion(SPYURK_FORM_VERSION)).toBe(true);
    expect(isSpyurkFormVersion(FORM_VERSION)).toBe(false);
  });
});
