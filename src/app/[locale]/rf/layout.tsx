import { YandexMetrika } from '@/components/analytics/yandex-metrika';
import { resolveYandexMetrikaId } from '@/lib/analytics/yandex-metrika';

type SpyurkLayoutProps = {
  children: React.ReactNode;
};

/** Yandex Metrika is scoped to the Spyurk RF questionnaire only. */
export default function SpyurkLayout({ children }: SpyurkLayoutProps) {
  const yandexMetrikaId = resolveYandexMetrikaId();

  return (
    <>
      {yandexMetrikaId ? <YandexMetrika counterId={yandexMetrikaId} /> : null}
      {children}
    </>
  );
}
