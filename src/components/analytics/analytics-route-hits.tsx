'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { trackMetaPageView } from '@/lib/analytics/meta-pixel';
import { isSpyurkFormPath } from '@/lib/analytics/route-scope';
import { trackYandexMetrikaPage } from '@/lib/analytics/yandex-metrika';

/** Sends the first page hit and one hit after each App Router navigation, including locale changes. */
export function AnalyticsRouteHits() {
  const pathname = usePathname();
  const isFirstLoad = useRef(true);

  useEffect(() => {
    const isFirst = isFirstLoad.current;
    if (isFirst) {
      isFirstLoad.current = false;
    }

    trackYandexMetrikaPage();

    if (!isFirst && !isSpyurkFormPath(pathname)) {
      trackMetaPageView();
    }
  }, [pathname]);

  return null;
}
