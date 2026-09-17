import { describe, expect, it } from 'vitest';
import { isSpyurkFormPath, shouldInitMetaPixel } from '@/lib/analytics/route-scope';

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
