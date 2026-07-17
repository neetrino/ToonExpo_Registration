import type { Metadata } from 'next';
import { Geist, Noto_Sans, Noto_Sans_Armenian, Unbounded } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  subsets: ['latin'],
  variable: '--font-geist-sans',
});

const notoSans = Noto_Sans({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-noto-sans',
  weight: ['400', '500', '600', '700'],
});

const notoSansArmenian = Noto_Sans_Armenian({
  subsets: ['armenian'],
  variable: '--font-noto-armenian',
  weight: ['400', '500', '600', '700'],
});

const unbounded = Unbounded({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-unbounded',
  weight: ['700', '800'],
});

export const metadata: Metadata = {
  title: 'Toon Expo Registration',
  description: 'Register for Toon Expo — event details to be confirmed.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="hy" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${notoSans.variable} ${notoSansArmenian.variable} ${unbounded.variable} min-h-screen antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
