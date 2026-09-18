import { describe, expect, it } from 'vitest';
import {
  isMetaEventSetupPath,
  isSpyurkFormPath,
  shouldInitMetaPixel,
} from '@/lib/analytics/route-scope';

describe('isSpyurkFormPath', () => {
  it('accepts the Spyurk RF routes', () => {
    expect(isSpyurkFormPath('/rf')).toBe(true);
    expect(isSpyurkFormPath('/ru/rf')).toBe(true);
    expect(isSpyurkFormPath('/hy/rf')).toBe(true);
    expect(isSpyurkFormPath('/en/rf')).toBe(true);
  });

  it('rejects the general questionnaire and private routes', () => {
    expect(isSpyurkFormPath('/hy')).toBe(false);
    expect(isSpyurkFormPath('/en/success')).toBe(false);
    expect(isSpyurkFormPath('/ru/privacy')).toBe(false);
    expect(isSpyurkFormPath('/admin')).toBe(false);
    expect(isSpyurkFormPath('/ticket/abc')).toBe(false);
  });
});

describe('shouldInitMetaPixel', () => {
  it('loads on the general questionnaire', () => {
    expect(shouldInitMetaPixel('/hy')).toBe(true);
    expect(shouldInitMetaPixel('/en/success')).toBe(true);
  });

  it('skips Spyurk, admin and ticket routes', () => {
    expect(shouldInitMetaPixel('/ru/rf')).toBe(false);
    expect(shouldInitMetaPixel('/rf')).toBe(false);
    expect(shouldInitMetaPixel('/admin/login')).toBe(false);
    expect(shouldInitMetaPixel('/ticket/abc')).toBe(false);
  });
});

describe('isMetaEventSetupPath', () => {
  it('allows the root redirect and general questionnaire routes', () => {
    expect(isMetaEventSetupPath('/')).toBe(true);
    expect(isMetaEventSetupPath('/hy')).toBe(true);
    expect(isMetaEventSetupPath('/en/success')).toBe(true);
    expect(isMetaEventSetupPath('/ru/privacy')).toBe(true);
  });

  it('keeps private, API and Spyurk routes protected from framing', () => {
    expect(isMetaEventSetupPath('/hy/rf')).toBe(false);
    expect(isMetaEventSetupPath('/rf')).toBe(false);
    expect(isMetaEventSetupPath('/admin')).toBe(false);
    expect(isMetaEventSetupPath('/ticket/abc')).toBe(false);
    expect(isMetaEventSetupPath('/api/registrations')).toBe(false);
  });
});
