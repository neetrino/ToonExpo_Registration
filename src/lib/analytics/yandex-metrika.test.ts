import { afterEach, describe, expect, it, vi } from 'vitest';
import { REGISTRATION_COMPLETE_EVENT } from '@/lib/analytics/gtm';
import {
  DEFAULT_YANDEX_METRIKA_ID,
  buildYandexMetrikaSnippet,
  hitYandexMetrika,
  parseYandexMetrikaId,
  resetYandexMetrikaPageTracking,
  resolveYandexMetrikaId,
  trackYandexMetrikaPage,
  trackYandexRegistrationComplete,
} from '@/lib/analytics/yandex-metrika';

describe('parseYandexMetrikaId', () => {
  it('accepts the client counter', () => {
    expect(parseYandexMetrikaId(DEFAULT_YANDEX_METRIKA_ID)).toBe(DEFAULT_YANDEX_METRIKA_ID);
  });

  it('rejects empty and invalid values', () => {
    expect(parseYandexMetrikaId(undefined)).toBeNull();
    expect(parseYandexMetrikaId('')).toBeNull();
    expect(parseYandexMetrikaId('abc')).toBeNull();
    expect(parseYandexMetrikaId('112495551;alert(1)')).toBeNull();
  });
});

describe('resolveYandexMetrikaId', () => {
  it('falls back to the client counter when env is unset', () => {
    expect(resolveYandexMetrikaId(undefined)).toBe(DEFAULT_YANDEX_METRIKA_ID);
  });

  it('disables Metrika when env is blank', () => {
    expect(resolveYandexMetrikaId('')).toBeNull();
  });
});

describe('buildYandexMetrikaSnippet', () => {
  it('embeds only a validated numeric id', () => {
    const snippet = buildYandexMetrikaSnippet(DEFAULT_YANDEX_METRIKA_ID);

    expect(snippet).toContain(`tag.js?id=${DEFAULT_YANDEX_METRIKA_ID}`);
    expect(snippet).toContain(`ym(${DEFAULT_YANDEX_METRIKA_ID},'init'`);
    expect(snippet).toContain('defer:true');
    expect(snippet).toContain("p.indexOf('/admin')===0");
    expect(snippet).toContain("p.indexOf('/ticket')===0");
    expect(buildYandexMetrikaSnippet('not-an-id')).toBe('');
  });
});

describe('Yandex Metrika client calls', () => {
  afterEach(() => {
    delete window.ym;
    resetYandexMetrikaPageTracking();
  });

  it('sends a hit and a registration goal when ym is present', () => {
    const ym = vi.fn();
    window.ym = ym;

    hitYandexMetrika('https://reg.toonexpo.com/hy/success');
    trackYandexRegistrationComplete();

    expect(ym).toHaveBeenCalledWith(
      Number(DEFAULT_YANDEX_METRIKA_ID),
      'hit',
      'https://reg.toonexpo.com/hy/success',
    );
    expect(ym).toHaveBeenCalledWith(
      Number(DEFAULT_YANDEX_METRIKA_ID),
      'reachGoal',
      REGISTRATION_COMPLETE_EVENT,
    );
  });

  it('no-ops when ym is missing', () => {
    expect(() => hitYandexMetrika('https://reg.toonexpo.com/hy')).not.toThrow();
    expect(() => trackYandexRegistrationComplete()).not.toThrow();
  });

  it('chains SPA hits from the external referrer to the previous page', () => {
    const ym = vi.fn();
    window.ym = ym;
    document.title = 'Toon Expo';
    Object.defineProperty(document, 'referrer', {
      configurable: true,
      value: 'https://example.com/from',
    });

    window.history.pushState({}, '', '/hy');
    trackYandexMetrikaPage();
    const firstHref = location.href;

    expect(ym).toHaveBeenCalledWith(Number(DEFAULT_YANDEX_METRIKA_ID), 'hit', firstHref, {
      title: 'Toon Expo',
      referer: 'https://example.com/from',
    });

    document.title = 'Toon Expo EN';
    window.history.pushState({}, '', '/en');
    trackYandexMetrikaPage();

    expect(ym).toHaveBeenLastCalledWith(Number(DEFAULT_YANDEX_METRIKA_ID), 'hit', location.href, {
      title: 'Toon Expo EN',
      referer: firstHref,
    });

    trackYandexMetrikaPage();
    expect(ym).toHaveBeenCalledTimes(2);
  });
});
