import type { MouseEvent } from 'react';

/** Drops a fragment so a refresh stays at the top of the page. */
export function clearLocationHash(): void {
  if (window.location.hash.length === 0) {
    return;
  }

  const nextUrl = `${window.location.pathname}${window.location.search}`;
  window.history.replaceState(window.history.state, '', nextUrl);
}

/** Scrolls to an on-page section without writing a hash. Leaves the link alone when the target is absent. */
export function scrollToSection(event: MouseEvent<HTMLAnchorElement>, sectionId: string): void {
  const target = document.getElementById(sectionId);
  if (!target) {
    return;
  }

  event.preventDefault();
  clearLocationHash();
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
}
