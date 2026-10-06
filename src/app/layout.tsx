import type { Metadata, Viewport } from 'next';
import { Analytics } from '@vercel/analytics/react';
import { Geist } from 'next/font/google';
import { buildMetaPixelSnippet, resolveMetaPixelId } from '@/lib/analytics/meta-pixel';
import { getMetadataBase, SITE_DESCRIPTION, SITE_NAME, SITE_TITLE } from '@/lib/brand/site';
import './fonts.css';
import './globals.css';

const geistSans = Geist({
  subsets: ['latin'],
  variable: '--font-geist-sans',
});

/** Removes a fragment before paint so refresh does not jump to an in-page anchor. */
const STRIP_LOCATION_HASH_SCRIPT =
  'if(location.hash){history.replaceState(history.state,"",location.pathname+location.search);scrollTo(0,0);document.addEventListener("DOMContentLoaded",function(){scrollTo(0,0)});addEventListener("load",function(){scrollTo(0,0)})}';

export const viewport: Viewport = {
  themeColor: '#00303D',
};

export const metadata: Metadata = {
  metadataBase: getMetadataBase(),
  applicationName: SITE_NAME,
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  openGraph: {
    type: 'website',
    locale: 'hy_AM',
    alternateLocale: ['en_US', 'ru_RU'],
    siteName: SITE_NAME,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const metaPixelId = resolveMetaPixelId();
  const metaPixelSnippet = metaPixelId ? buildMetaPixelSnippet(metaPixelId) : '';

  return (
    <html lang="hy" suppressHydrationWarning>
      <head>
        <script
          id="strip-location-hash"
          dangerouslySetInnerHTML={{ __html: STRIP_LOCATION_HASH_SCRIPT }}
        />
        {metaPixelSnippet ? (
          <script id="meta-pixel" dangerouslySetInnerHTML={{ __html: metaPixelSnippet }} />
        ) : null}
      </head>
      <body className={`${geistSans.variable} min-h-dvh bg-primary antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
