import { AnalyticsRouteHits } from '@/components/analytics/analytics-route-hits';
import { GoogleTagManager } from '@/components/analytics/google-tag-manager';
import { MetaPixelNoscriptGate } from '@/components/analytics/meta-pixel-noscript-gate';
import { resolveGtmContainerId } from '@/lib/analytics/gtm';

/** GTM on public `[locale]` routes. Pixels are split: Meta = general, Yandex = Spyurk. */
export function PublicAnalytics() {
  const gtmContainerId = resolveGtmContainerId();

  return (
    <>
      {gtmContainerId ? <GoogleTagManager containerId={gtmContainerId} /> : null}
      <MetaPixelNoscriptGate />
      <AnalyticsRouteHits />
    </>
  );
}
