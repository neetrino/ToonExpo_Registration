import { cleanup, render } from '@testing-library/react';
import { useRef } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AUTOFILL_PHONE_POLL_MS, useAdoptAutofilledPhone } from './use-adopt-autofilled-phone';

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

function PhoneProbe({ onPhoneChange }: { onPhoneChange: (value: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  useAdoptAutofilledPhone({
    inputRef,
    country: 'AM',
    phoneDigits: '',
    onPhoneChange,
  });
  return <input ref={inputRef} aria-label="phone" />;
}

describe('useAdoptAutofilledPhone', () => {
  it('adopts a number delivered with an input event', () => {
    const onPhoneChange = vi.fn();
    const { getByRole } = render(<PhoneProbe onPhoneChange={onPhoneChange} />);
    const input = getByRole('textbox', { name: 'phone' }) as HTMLInputElement;
    input.value = '+374 95 117710';
    input.dispatchEvent(new Event('input', { bubbles: true }));

    expect(onPhoneChange).toHaveBeenCalledWith('95117710');
  });

  it('adopts a value written past the instance setter, as WebKit autofill can', () => {
    vi.useFakeTimers();
    const onPhoneChange = vi.fn();
    const { getByRole } = render(<PhoneProbe onPhoneChange={onPhoneChange} />);
    const input = getByRole('textbox', { name: 'phone' });
    const prototypeSet = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
    expect(prototypeSet).toBeTypeOf('function');
    prototypeSet?.call(input, '095117710');

    vi.advanceTimersByTime(AUTOFILL_PHONE_POLL_MS);

    expect(onPhoneChange).toHaveBeenCalledWith('95117710');
  });
});
