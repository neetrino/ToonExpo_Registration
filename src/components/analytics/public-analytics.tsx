import { AnalyticsRouteHits } from '@/components/analytics/analytics-route-hits';
import { GoogleTagManager } from '@/components/analytics/google-tag-manager';
import { MetaPixel } from '@/components/analytics/meta-pixel';
import { YandexMetrika } from '@/components/analytics/yandex-metrika';
import { resolveGtmContainerId } from '@/lib/analytics/gtm';
import { resolveMetaPixelId } from '@/lib/analytics/meta-pixel';
import { resolveYandexMetrikaId } from '@/lib/analytics/yandex-metrika';

/** Loads public-route analytics only. Do not mount on `/ticket` or `/admin`. */
export function PublicAnalytics() {
  const gtmContainerId = resolveGtmContainerId();
  const yandexMetrikaId = resolveYandexMetrikaId();
  const metaPixelId = resolveMetaPixelId();

  return (
    <>
      {gtmContainerId ? <GoogleTagManager containerId={gtmContainerId} /> : null}
      {yandexMetrikaId ? <YandexMetrika counterId={yandexMetrikaId} /> : null}
      {metaPixelId ? <MetaPixel pixelId={metaPixelId} /> : null}
      <AnalyticsRouteHits />
    </>
  );
}
