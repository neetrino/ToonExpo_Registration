import { ImageResponse } from 'next/og';
import { getBrandLogoDataUri } from '@/lib/brand/logo-data-uri';
import { BRAND_PRIMARY } from '@/lib/brand/site';

export async function createBrandIconImage(px: number): Promise<ImageResponse> {
  const logoSrc = await getBrandLogoDataUri();
  const logoSize = Math.round(px * 0.72);

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: BRAND_PRIMARY,
        }}
      >
        <img alt="" src={logoSrc} width={logoSize} height={logoSize} />
      </div>
    ),
    { width: px, height: px },
  );
}
