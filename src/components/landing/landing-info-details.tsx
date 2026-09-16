'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

type LandingInfoDetailsProps = {
  aboutToggle: string;
  paragraphs: string[];
};

const EXPAND_MS = 420;

/** Scroll until the site footer sits fully at the bottom of the viewport. */
function scrollFooterIntoView(): void {
  const footer = document.querySelector('footer');
  if (!footer) {
    return;
  }

  const viewportHeight = window.visualViewport?.height ?? window.innerHeight;
  const footerBottom = footer.getBoundingClientRect().bottom;
  const delta = footerBottom - viewportHeight;
  if (delta > 1) {
    window.scrollBy({ top: delta, behavior: 'auto' });
  }
}

/**
 * Collapsible “about the exhibition” panel with height/opacity animation.
 * Opening follows the growing content and lands so the page footer is visible.
 */
export function LandingInfoDetails({ aboutToggle, paragraphs }: LandingInfoDetailsProps) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const rafRef = useRef<number | null>(null);

  const cancelScrollFollow = () => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  };

  useEffect(() => cancelScrollFollow, []);

  const followOpenScroll = (reduceMotion: boolean) => {
    cancelScrollFollow();

    if (reduceMotion) {
      requestAnimationFrame(scrollFooterIntoView);
      return;
    }

    const startedAt = performance.now();
    const loop = (now: number) => {
      scrollFooterIntoView();
      if (now - startedAt < EXPAND_MS + 80) {
        rafRef.current = requestAnimationFrame(loop);
        return;
      }
      scrollFooterIntoView();
      rafRef.current = null;
    };
    rafRef.current = requestAnimationFrame(loop);
  };

  const toggle = () => {
    const next = !open;
    setOpen(next);
    cancelScrollFollow();

    if (!next) {
      return;
    }

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    followOpenScroll(reduceMotion);
  };

  return (
    <div className="w-full min-w-0 max-w-xl space-y-3 text-center sm:text-left">
      <div className="border-t border-white/15 pt-3">
        <button
          type="button"
          className="cursor-pointer text-sm font-semibold text-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-highlight focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={toggle}
        >
          <span className="inline-flex items-center justify-center gap-2 sm:justify-start">
            <span
              aria-hidden="true"
              className="inline-block text-accent transition-transform duration-[420ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
              style={{ transform: open ? 'rotate(90deg)' : 'rotate(0deg)' }}
            >
              ▸
            </span>
            {aboutToggle}
          </span>
        </button>

        <div
          id={panelId}
          className={cn(
            'grid transition-[grid-template-rows] duration-[420ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none',
            open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
          )}
          aria-hidden={!open}
        >
          <div className="min-h-0 overflow-hidden">
            <div
              className={cn(
                'mt-3 space-y-3 text-left text-sm leading-relaxed text-white/75 transition-opacity duration-[420ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none',
                open ? 'opacity-100' : 'opacity-0',
              )}
            >
              {paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
