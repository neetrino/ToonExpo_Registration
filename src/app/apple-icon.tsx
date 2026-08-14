import { ImageResponse } from 'next/og';
import { getBrandLogoDataUri } from '@/lib/brand/logo-data-uri';
import { BRAND_PRIMARY } from '@/lib/brand/site';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default async function AppleIcon() {
  const logoSrc = await getBrandLogoDataUri();

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
        <img alt="" src={logoSrc} width={118} height={120} />
      </div>
    ),
    { ...size },
  );
}
