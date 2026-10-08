import { parseYandexMetrikaId } from '@/lib/analytics/yandex-metrika';

type YandexMetrikaProps = {
  counterId: string;
};

/** Noscript beacon for visitors without JavaScript. The loader lives in the document head. */
export function YandexMetrika({ counterId }: YandexMetrikaProps) {
  const safeId = parseYandexMetrikaId(counterId);
  if (!safeId) {
    return null;
  }

  return (
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
  );
}
