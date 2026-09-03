'use client';

import { useEffect } from 'react';
import { pushRegistrationCompleteEvent } from '@/lib/analytics/gtm';

/** Pushes a GTM conversion event when the success page mounts. */
export function RegistrationCompleteTracker() {
  useEffect(() => {
    pushRegistrationCompleteEvent();
  }, []);

  return null;
}
