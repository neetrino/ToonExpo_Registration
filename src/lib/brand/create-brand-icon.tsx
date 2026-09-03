import { ImageResponse } from 'next/og';
import { getBrandLogoDataUri } from '@/lib/brand/logo-data-uri';

const BRAND_LOGO_WIDTH = 952;
const BRAND_LOGO_HEIGHT = 1024;

export async function createBrandIconImage(px: number): Promise<ImageResponse> {
  const logoSrc = await getBrandLogoDataUri('color');
  const logoHeight = Math.round(px * 0.86);
  const logoWidth = Math.round(logoHeight * (BRAND_LOGO_WIDTH / BRAND_LOGO_HEIGHT));

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#ffffff',
      }}
    >
      <img alt="" src={logoSrc} width={logoWidth} height={logoHeight} />
    </div>,
    { width: px, height: px },
  );
}
