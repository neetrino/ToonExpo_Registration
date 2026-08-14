import type { Metadata, Viewport } from 'next';
import { Analytics } from '@vercel/analytics/react';
import { Geist, Noto_Sans, Noto_Sans_Armenian, Unbounded } from 'next/font/google';
import { getMetadataBase, SITE_DESCRIPTION, SITE_NAME, SITE_TITLE } from '@/lib/brand/site';
import './globals.css';

const geistSans = Geist({
  subsets: ['latin'],
  variable: '--font-geist-sans',
});

const notoSans = Noto_Sans({
  subsets: ['latin'],
  variable: '--font-noto-sans',
  weight: ['400', '700'],
  display: 'swap',
});

const notoSansCyrillic = Noto_Sans({
  subsets: ['cyrillic'],
  variable: '--font-noto-cyrillic',
  weight: ['400', '700'],
  display: 'swap',
});

const notoSansArmenian = Noto_Sans_Armenian({
  subsets: ['armenian'],
  variable: '--font-noto-armenian',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

const unbounded = Unbounded({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-unbounded',
  weight: ['700', '800'],
  display: 'swap',
});

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
  return (
    <html lang="hy" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${notoSans.variable} ${notoSansCyrillic.variable} ${notoSansArmenian.variable} ${unbounded.variable} min-h-dvh bg-primary antialiased`}
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}
