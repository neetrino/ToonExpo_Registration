import { ImageResponse } from 'next/og';
import { getBrandLogoDataUri } from '@/lib/brand/logo-data-uri';
import {
  BRAND_ACCENT,
  BRAND_HIGHLIGHT,
  BRAND_PRIMARY,
  SITE_DESCRIPTION,
  SITE_EVENT_LINE,
  SITE_NAME,
} from '@/lib/brand/site';

export const alt = SITE_DESCRIPTION;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OpenGraphImage() {
  const logoSrc = await getBrandLogoDataUri();

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        background: BRAND_PRIMARY,
        padding: '72px 80px',
        color: '#ffffff',
      }}
    >
      <div
        style={{
          display: 'flex',
          height: 6,
          width: 160,
          background: BRAND_HIGHLIGHT,
          borderRadius: 4,
        }}
      />
      <div style={{ display: 'flex', alignItems: 'center', gap: 36 }}>
        <img alt="" src={logoSrc} width={168} height={181} />
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              display: 'flex',
              fontSize: 72,
              fontWeight: 800,
              letterSpacing: -2,
              lineHeight: 1.05,
            }}
          >
            {SITE_NAME}
          </div>
          <div
            style={{
              display: 'flex',
              marginTop: 12,
              fontSize: 36,
              color: BRAND_ACCENT,
              fontWeight: 600,
            }}
          >
            Invest 2026 Vol. 2
          </div>
        </div>
      </div>
      <div
        style={{
          display: 'flex',
          fontSize: 28,
          color: 'rgba(255,255,255,0.82)',
        }}
      >
        {SITE_EVENT_LINE}
      </div>
    </div>,
    { ...size },
  );
}
