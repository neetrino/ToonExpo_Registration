import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Toon Expo Ticket',
  robots: {
    index: false,
    follow: false,
  },
};

export default function TicketLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-dvh bg-[#f4f7f8] text-[#00303d]">{children}</div>;
}
