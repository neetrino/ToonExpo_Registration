import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  DEFAULT_META_PIXEL_ID,
  META_COMPLETE_REGISTRATION_EVENT,
  buildMetaPixelSnippet,
  parseMetaPixelId,
  resolveMetaPixelId,
  trackMetaPageView,
  trackMetaRegistrationComplete,
} from '@/lib/analytics/meta-pixel';

describe('parseMetaPixelId', () => {
  it('accepts the client pixel', () => {
    expect(parseMetaPixelId(DEFAULT_META_PIXEL_ID)).toBe(DEFAULT_META_PIXEL_ID);
  });

  it('rejects empty and invalid values', () => {
    expect(parseMetaPixelId(undefined)).toBeNull();
    expect(parseMetaPixelId('')).toBeNull();
    expect(parseMetaPixelId('abc')).toBeNull();
    expect(parseMetaPixelId(`${DEFAULT_META_PIXEL_ID}');alert(1)//`)).toBeNull();
  });
});

describe('resolveMetaPixelId', () => {
  it('falls back to the client pixel when env is unset', () => {
    expect(resolveMetaPixelId(undefined)).toBe(DEFAULT_META_PIXEL_ID);
  });

  it('disables the pixel when env is blank', () => {
    expect(resolveMetaPixelId('')).toBeNull();
  });
});

describe('buildMetaPixelSnippet', () => {
  it('embeds only a validated numeric id', () => {
    const snippet = buildMetaPixelSnippet(DEFAULT_META_PIXEL_ID);

    expect(snippet).toContain(`fbq('init', '${DEFAULT_META_PIXEL_ID}')`);
    expect(snippet).toContain(`fbq('track', 'PageView')`);
    expect(buildMetaPixelSnippet('not-an-id')).toBe('');
  });
});

describe('Meta Pixel client calls', () => {
  afterEach(() => {
    delete window.fbq;
  });

  it('sends PageView and CompleteRegistration when fbq is present', () => {
    const fbq = vi.fn();
    window.fbq = fbq;

    trackMetaPageView();
    trackMetaRegistrationComplete();

    expect(fbq).toHaveBeenCalledWith('track', 'PageView');
    expect(fbq).toHaveBeenCalledWith('track', META_COMPLETE_REGISTRATION_EVENT);
  });

  it('no-ops when fbq is missing', () => {
    expect(() => trackMetaPageView()).not.toThrow();
    expect(() => trackMetaRegistrationComplete()).not.toThrow();
  });
});
