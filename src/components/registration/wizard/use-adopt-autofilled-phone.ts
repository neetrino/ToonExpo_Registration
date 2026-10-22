'use client';

import { useEffect, useRef, type RefObject } from 'react';
import type { CountryCode } from 'libphonenumber-js';
import { adoptAutofilledPhoneDigits } from './adopt-autofilled-phone';

/** How often to read a phone input that in-app browsers fill without an event. */
export const AUTOFILL_PHONE_POLL_MS = 250;

type UseAdoptAutofilledPhoneArgs = {
  inputRef: RefObject<HTMLInputElement | null>;
  country: CountryCode;
  phoneDigits: string;
  onPhoneChange: (value: string) => void;
};

/**
 * Copies a browser-painted phone into wizard state as national digits.
 * Messenger and other in-app browsers set `.value` without React `onChange`.
 */
export function useAdoptAutofilledPhone({
  inputRef,
  country,
  phoneDigits,
  onPhoneChange,
}: UseAdoptAutofilledPhoneArgs): void {
  const latestRef = useRef({ country, phoneDigits, onPhoneChange });

  useEffect(() => {
    latestRef.current = { country, phoneDigits, onPhoneChange };
  }, [country, phoneDigits, onPhoneChange]);

  useEffect(() => {
    const input = inputRef.current;
    if (!input) {
      return undefined;
    }

    const adopt = () => {
      const latest = latestRef.current;
      const digits = adoptAutofilledPhoneDigits(input.value, latest.country, latest.phoneDigits);
      if (digits === null) {
        return;
      }

      latestRef.current = { ...latest, phoneDigits: digits };
      latest.onPhoneChange(digits);
    };

    return subscribeToExternalPhoneValue(input, adopt);
  }, [inputRef]);
}

function subscribeToExternalPhoneValue(
  input: HTMLInputElement,
  onExternalValue: () => void,
): () => void {
  input.addEventListener('input', onExternalValue);
  input.addEventListener('change', onExternalValue);
  const poll = window.setInterval(() => {
    if (document.visibilityState !== 'hidden') {
      onExternalValue();
    }
  }, AUTOFILL_PHONE_POLL_MS);

  return () => {
    input.removeEventListener('input', onExternalValue);
    input.removeEventListener('change', onExternalValue);
    window.clearInterval(poll);
  };
}
