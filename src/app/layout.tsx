import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  subsets: ['latin'],
  variable: '--font-geist-sans',
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
      <body className={`${geistSans.variable} min-h-screen antialiased`}>{children}</body>
    </html>
  );
}
