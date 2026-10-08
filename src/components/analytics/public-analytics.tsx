import { AnalyticsRouteHits } from '@/components/analytics/analytics-route-hits';
import { GoogleTagManager } from '@/components/analytics/google-tag-manager';
import { MetaPixelNoscriptGate } from '@/components/analytics/meta-pixel-noscript-gate';
import { YandexMetrika } from '@/components/analytics/yandex-metrika';
import { resolveGtmContainerId } from '@/lib/analytics/gtm';
import { resolveYandexMetrikaId } from '@/lib/analytics/yandex-metrika';

/** GTM and Yandex Metrika on public `[locale]` routes. Meta Pixel stays on the general form only. */
export function PublicAnalytics() {
  const gtmContainerId = resolveGtmContainerId();
  const yandexMetrikaId = resolveYandexMetrikaId();

  return (
    <>
      {gtmContainerId ? <GoogleTagManager containerId={gtmContainerId} /> : null}
      {yandexMetrikaId ? <YandexMetrika counterId={yandexMetrikaId} /> : null}
      <MetaPixelNoscriptGate />
      <AnalyticsRouteHits />
    </>
  );
}
