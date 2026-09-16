'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

type LandingInfoDetailsProps = {
  aboutToggle: string;
  paragraphs: string[];
};

const EXPAND_MS = 420;

/**
 * Collapsible “about the exhibition” panel with height/opacity animation
 * and a smooth scroll so the opened copy lands fully in view.
 */
export function LandingInfoDetails({ aboutToggle, paragraphs }: LandingInfoDetailsProps) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const sectionRef = useRef<HTMLDivElement>(null);
  const scrollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (scrollTimerRef.current) {
        clearTimeout(scrollTimerRef.current);
      }
    };
  }, []);

  const toggle = () => {
    const next = !open;
    setOpen(next);

    if (scrollTimerRef.current) {
      clearTimeout(scrollTimerRef.current);
      scrollTimerRef.current = null;
    }

    if (!next) {
      return;
    }

    const reduceMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    scrollTimerRef.current = setTimeout(
      () => {
        // Prefer showing the full opened block; if it is tall, keep the end in view.
        sectionRef.current?.scrollIntoView({
          behavior: reduceMotion ? 'auto' : 'smooth',
          block: 'end',
        });
        scrollTimerRef.current = null;
      },
      reduceMotion ? 0 : EXPAND_MS,
    );
  };

  return (
    <div ref={sectionRef} className="w-full min-w-0 max-w-xl space-y-3 text-center sm:text-left">
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
