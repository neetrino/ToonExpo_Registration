'use client';

import { useEffect, useRef, type RefObject } from 'react';

const FIELD_ANCHOR_SELECTOR = '[data-wizard-field]';

export function scrollWizardToTop(element: HTMLElement | null): void {
  if (!element) {
    return;
  }

  element.scrollIntoView({ behavior: scrollBehavior(), block: 'start' });
}

/**
 * Deepest invalid control in document order.
 * A nested “other” input wins over an ancestor option group.
 */
export function findFirstInvalidField(container: HTMLElement): HTMLElement | null {
  const invalid = container.querySelectorAll<HTMLElement>('[aria-invalid="true"]');
  let target: HTMLElement | null = null;

  for (const element of invalid) {
    if (!target || target.contains(element)) {
      target = element;
    }
  }

  return target;
}

/** Scrolls the first invalid field into view after the error state is painted. */
export function scrollToFirstInvalidField(container: HTMLElement | null): void {
  if (!container) {
    return;
  }

  const control = findFirstInvalidField(container);
  if (!control) {
    scrollWizardToTop(container);
    return;
  }

  const target = control.closest<HTMLElement>(FIELD_ANCHOR_SELECTOR) ?? control;
  target.style.scrollMarginTop = '1.5rem';
  target.style.scrollMarginBottom = '1.5rem';

  if (!isFullyVisible(target)) {
    target.scrollIntoView({ behavior: scrollBehavior(), block: 'center' });
  }

  if (isTextControl(control)) {
    control.focus({ preventScroll: true });
  }
}

/**
 * Call the returned function in the same turn as `setFieldErrors`.
 * Scrolling waits until the invalid control is in the DOM.
 */
export function useScrollToFieldError(
  containerRef: RefObject<HTMLElement | null>,
  fieldErrors: object,
  stepId: string,
): () => void {
  const pendingRef = useRef(false);

  useEffect(() => {
    if (!pendingRef.current) {
      return;
    }

    pendingRef.current = false;
    scrollToFirstInvalidField(containerRef.current);
  }, [containerRef, fieldErrors, stepId]);

  return () => {
    pendingRef.current = true;
  };
}

function scrollBehavior(): ScrollBehavior {
  if (typeof window.matchMedia !== 'function') {
    return 'smooth';
  }

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return 'auto';
  }

  return 'smooth';
}

function isTextControl(element: HTMLElement): element is HTMLInputElement | HTMLTextAreaElement {
  return element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement;
}

function isFullyVisible(element: HTMLElement): boolean {
  const rect = element.getBoundingClientRect();
  return rect.top >= 0 && rect.bottom <= window.innerHeight && rect.height > 0;
}
