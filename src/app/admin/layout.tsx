import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin — Toon Expo Registration',
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = 'force-dynamic';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
