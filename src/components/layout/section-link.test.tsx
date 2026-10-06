import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { UtmLandingCapture } from '@/components/attribution/utm-landing-capture';
import { SectionLink } from '@/components/layout/section-link';
import { loadPersistedUtmAttribution } from '@/components/registration/utm-attribution';

vi.mock('next/navigation', () => ({
  usePathname: () => '/ru/rf',
}));

const UTM_SEARCH = '?utm_source=vk&utm_medium=cpc&utm_campaign=tey26';
const STORED_UTM = {
  utmSource: 'vk',
  utmMedium: 'cpc',
  utmCampaign: 'tey26',
} as const;

const CTA_LABELS = ['Регистрация', 'Зарегистрироваться', 'Как это работает'] as const;

function renderRfCtas(): void {
  render(
    <>
      <UtmLandingCapture />
      <div id="how-it-works" />
      <div id="registration" />
      <SectionLink sectionId="registration">Регистрация</SectionLink>
      <SectionLink sectionId="registration">Зарегистрироваться</SectionLink>
      <SectionLink sectionId="how-it-works">Как это работает</SectionLink>
    </>,
  );
}

describe('RF registration and how-it-works links', () => {
  beforeEach(() => {
    sessionStorage.clear();
    window.history.replaceState(null, '', `/ru/rf${UTM_SEARCH}`);
    vi.stubGlobal('matchMedia', () => ({ matches: true }));
    Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
      configurable: true,
      value: vi.fn(),
    });
  });

  afterEach(() => {
    sessionStorage.clear();
    window.history.replaceState(null, '', '/');
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('stores landing UTM before either CTA is clicked', () => {
    renderRfCtas();

    expect(loadPersistedUtmAttribution()).toEqual(STORED_UTM);
    expect(window.location.search).toBe(UTM_SEARCH);
  });

  it('keeps the URL query and stored UTM after each CTA click', () => {
    renderRfCtas();

    for (const label of CTA_LABELS) {
      fireEvent.click(screen.getByRole('link', { name: label }));

      expect(window.location.pathname).toBe('/ru/rf');
      expect(window.location.search).toBe(UTM_SEARCH);
      expect(window.location.hash).toBe('');
      expect(loadPersistedUtmAttribution()).toEqual(STORED_UTM);
    }
  });

  it('uses a fragment href so a normal click keeps the UTM query', () => {
    renderRfCtas();

    for (const label of CTA_LABELS) {
      const href = screen.getByRole('link', { name: label }).getAttribute('href');
      expect(href).toMatch(/^#/);

      const next = new URL(href ?? '', window.location.href);
      expect(next.pathname).toBe('/ru/rf');
      expect(next.search).toBe(UTM_SEARCH);
    }
  });
});
