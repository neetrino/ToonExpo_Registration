'use client';

import { usePathname } from 'next/navigation';
import { MetaPixelNoscript } from '@/components/analytics/meta-pixel';
import { resolveMetaPixelId } from '@/lib/analytics/meta-pixel';
import { isSpyurkFormPath } from '@/lib/analytics/route-scope';

/** Noscript Meta beacon on the general questionnaire only. */
export function MetaPixelNoscriptGate() {
  const pathname = usePathname();
  const metaPixelId = resolveMetaPixelId();

  if (!metaPixelId || isSpyurkFormPath(pathname)) {
    return null;
  }

  return <MetaPixelNoscript pixelId={metaPixelId} />;
}
