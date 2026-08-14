import type { Metadata, Viewport } from 'next';
import { Analytics } from '@vercel/analytics/react';
import { Geist } from 'next/font/google';
import { getMetadataBase, SITE_DESCRIPTION, SITE_NAME, SITE_TITLE } from '@/lib/brand/site';
import './fonts.css';
import './globals.css';

const geistSans = Geist({
  subsets: ['latin'],
  variable: '--font-geist-sans',
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
      <body className={`${geistSans.variable} min-h-dvh bg-primary antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
