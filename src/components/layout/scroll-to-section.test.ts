import { afterEach, describe, expect, it, vi } from 'vitest';
import type { MouseEvent } from 'react';
import { clearLocationHash, scrollToSection } from './scroll-to-section';

function clickEvent(): MouseEvent<HTMLAnchorElement> {
  return { preventDefault: vi.fn() } as unknown as MouseEvent<HTMLAnchorElement>;
}

describe('clearLocationHash', () => {
  afterEach(() => {
    window.history.replaceState(null, '', '/ru/rf');
  });

  it('removes a fragment and keeps the path and query', () => {
    window.history.replaceState(null, '', '/ru/rf?utm_source=vk#registration');

    clearLocationHash();

    expect(window.location.pathname).toBe('/ru/rf');
    expect(window.location.search).toBe('?utm_source=vk');
    expect(window.location.hash).toBe('');
  });

  it('leaves a URL without a fragment unchanged', () => {
    const replaceState = vi.spyOn(window.history, 'replaceState');
    window.history.replaceState(null, '', '/ru/rf');
    replaceState.mockClear();

    clearLocationHash();

    expect(replaceState).not.toHaveBeenCalled();
    replaceState.mockRestore();
  });
});

describe('scrollToSection', () => {
  afterEach(() => {
    document.body.replaceChildren();
    window.history.replaceState(null, '', '/ru/rf');
    vi.unstubAllGlobals();
  });

  function stubMotion(): void {
    vi.stubGlobal('matchMedia', () => ({ matches: false }));
  }

  it('scrolls without keeping the hash', () => {
    document.body.innerHTML = '<div id="registration"></div>';
    window.history.replaceState(null, '', '/ru/rf#registration');
    const target = document.getElementById('registration');
    const scrollIntoView = vi.fn();
    if (!target) {
      throw new Error('missing target');
    }
    target.scrollIntoView = scrollIntoView;
    const event = clickEvent();
    stubMotion();

    scrollToSection(event, 'registration');

    expect(event.preventDefault).toHaveBeenCalledTimes(1);
    expect(window.location.hash).toBe('');
    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' });
  });

  it('does not cancel the click when the section is missing', () => {
    const event = clickEvent();

    scrollToSection(event, 'registration');

    expect(event.preventDefault).not.toHaveBeenCalled();
  });
});
