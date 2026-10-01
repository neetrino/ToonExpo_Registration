import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render } from '@testing-library/react';
import { UtmLandingCapture } from '@/components/attribution/utm-landing-capture';

const captureAndPersistUtmFromLocation = vi.hoisted(() => vi.fn());
const pathnameRef = vi.hoisted(() => ({ current: '/hy' }));

vi.mock('next/navigation', () => ({
  usePathname: () => pathnameRef.current,
}));

vi.mock('@/components/registration/utm-attribution', () => ({
  captureAndPersistUtmFromLocation,
}));

describe('UtmLandingCapture', () => {
  beforeEach(() => {
    captureAndPersistUtmFromLocation.mockReset();
    pathnameRef.current = '/hy';
  });

  it('captures UTM on mount for the current public route', () => {
    render(<UtmLandingCapture />);

    expect(captureAndPersistUtmFromLocation).toHaveBeenCalledTimes(1);
  });

  it('recaptures when the pathname changes', () => {
    const { rerender } = render(<UtmLandingCapture />);
    pathnameRef.current = '/hy/privacy';
    rerender(<UtmLandingCapture />);

    expect(captureAndPersistUtmFromLocation).toHaveBeenCalledTimes(2);
  });
});
