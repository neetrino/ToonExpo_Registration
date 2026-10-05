import type { MouseEvent } from 'react';

/** Scrolls to an on-page section. Leaves the link alone when the target is absent. */
export function scrollToSection(event: MouseEvent<HTMLAnchorElement>, sectionId: string): void {
  const target = document.getElementById(sectionId);
  if (!target) {
    return;
  }

  event.preventDefault();
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
}
