'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { captureAndPersistUtmFromLocation } from '@/components/registration/utm-attribution';

/**
 * Capture UTM on first public landing (and later navigations).
 * Persists first non-empty values so later pages without query keep attribution.
 */
export function UtmLandingCapture() {
  const pathname = usePathname();

  useEffect(() => {
    captureAndPersistUtmFromLocation();
  }, [pathname]);

  return null;
}
