import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { AdminSearchForm } from '@/components/admin/admin-search-form';
import { ADMIN_SEARCH_DEBOUNCE_MS } from '@/lib/admin/constants';

const replace = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace }),
}));

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe('AdminSearchForm live search', () => {
  beforeEach(() => {
    replace.mockReset();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('searches after typing without waiting for Enter', async () => {
    render(<AdminSearchForm initialQuery="" variant="toolbar" />);

    await act(async () => {
      fireEvent.change(screen.getByLabelText('Search registrations'), { target: { value: 'sip' } });
    });
    expect(replace).not.toHaveBeenCalled();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(ADMIN_SEARCH_DEBOUNCE_MS);
    });

    expect(replace).toHaveBeenCalledTimes(1);
    expect(replace).toHaveBeenCalledWith('/admin?q=sip');
  });

  it('does not require a Search button in the toolbar', () => {
    render(<AdminSearchForm initialQuery="" variant="toolbar" />);
    expect(screen.queryByRole('button', { name: 'Search' })).toBeNull();
  });

  it('clears the query back to /admin', () => {
    render(<AdminSearchForm initialQuery="sipan" variant="toolbar" />);
    expect(screen.getByRole('link', { name: 'Clear' }).getAttribute('href')).toBe('/admin');
  });
});
