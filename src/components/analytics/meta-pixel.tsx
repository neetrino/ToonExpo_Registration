import Script from 'next/script';
import { buildMetaPixelSnippet, parseMetaPixelId } from '@/lib/analytics/meta-pixel';

type MetaPixelProps = {
  pixelId: string;
};

export function MetaPixel({ pixelId }: MetaPixelProps) {
  const safeId = parseMetaPixelId(pixelId);
  if (!safeId) {
    return null;
  }

  return (
    <>
      <Script
        id="meta-pixel"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: buildMetaPixelSnippet(safeId) }}
      />
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
    </>
  );
}
