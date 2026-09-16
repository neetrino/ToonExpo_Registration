'use client';

import { useEffect } from 'react';
import { consumeAnalyticsFormChannel } from '@/lib/analytics/form-channel-event';
import { pushRegistrationCompleteEvent } from '@/lib/analytics/gtm';
import { trackMetaRegistrationComplete } from '@/lib/analytics/meta-pixel';
import { trackYandexRegistrationComplete } from '@/lib/analytics/yandex-metrika';

/** Pushes conversion events when the success page mounts. */
export function RegistrationCompleteTracker() {
  useEffect(() => {
    pushRegistrationCompleteEvent(consumeAnalyticsFormChannel());
    trackYandexRegistrationComplete();
    trackMetaRegistrationComplete();
  }, []);

  return null;
}
