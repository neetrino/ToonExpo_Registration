import Script from 'next/script';
import { buildYandexMetrikaSnippet, parseYandexMetrikaId } from '@/lib/analytics/yandex-metrika';

type YandexMetrikaProps = {
  counterId: string;
};

export function YandexMetrika({ counterId }: YandexMetrikaProps) {
  const safeId = parseYandexMetrikaId(counterId);
  if (!safeId) {
    return null;
  }

  return (
    <>
      <Script
        id="yandex-metrika"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: buildYandexMetrikaSnippet(safeId) }}
      />
      <noscript>
        <div>
          {/* Tracking pixel: must be a raw img, not next/image. */}
          {/* eslint-disable-next-line @next/next/no-img-element -- Metrika noscript beacon */}
          <img
            src={`https://mc.yandex.ru/watch/${safeId}`}
            style={{ position: 'absolute', left: '-9999px' }}
            alt=""
          />
        </div>
      </noscript>
    </>
  );
}
