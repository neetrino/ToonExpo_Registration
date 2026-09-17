import { parseMetaPixelId } from '@/lib/analytics/meta-pixel';

type MetaPixelNoscriptProps = {
  pixelId: string;
};

export function MetaPixelNoscript({ pixelId }: MetaPixelNoscriptProps) {
  const safeId = parseMetaPixelId(pixelId);
  if (!safeId) {
    return null;
  }

  return (
    <noscript>
      {/* Tracking pixel: must be a raw img, not next/image. */}
      {/* eslint-disable-next-line @next/next/no-img-element -- Meta noscript beacon */}
      <img
        height={1}
        width={1}
        style={{ display: 'none' }}
        src={`https://www.facebook.com/tr?id=${safeId}&ev=PageView&noscript=1`}
        alt=""
      />
    </noscript>
  );
}
