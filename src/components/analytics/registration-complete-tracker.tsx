'use client';

import { useEffect } from 'react';
import { consumeAnalyticsFormChannel } from '@/lib/analytics/form-channel-event';
import { pushRegistrationCompleteEvent } from '@/lib/analytics/gtm';

/** Pushes a GTM conversion event when the success page mounts. */
export function RegistrationCompleteTracker() {
  useEffect(() => {
    pushRegistrationCompleteEvent(consumeAnalyticsFormChannel());
  }, []);

  return null;
}
