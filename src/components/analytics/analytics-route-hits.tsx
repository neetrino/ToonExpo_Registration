'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { trackMetaPageView } from '@/lib/analytics/meta-pixel';
import { hitYandexMetrika } from '@/lib/analytics/yandex-metrika';

/** Sends virtual pageviews on App Router navigations after the first load. */
export function AnalyticsRouteHits() {
  const pathname = usePathname();
  const isFirstLoad = useRef(true);

  useEffect(() => {
    if (isFirstLoad.current) {
      isFirstLoad.current = false;
      return;
    }

    hitYandexMetrika(window.location.href);
    trackMetaPageView();
  }, [pathname]);

  return null;
}
