import { notFound } from 'next/navigation';
import { getPrisma } from '@/lib/db/prisma';
import { TicketPageView } from '@/components/tickets/ticket-page-view';

export const dynamic = 'force-dynamic';

type TicketPageProps = {
  params: Promise<{ token: string }>;
};

/**
 * Private hosted ticket page. Token is a long unguessable bearer, not the scanner code.
 */
export default async function TicketPage({ params }: TicketPageProps) {
  const { token } = await params;
  if (!token || token.length < 20) {
    notFound();
  }

  const prisma = getPrisma();
  const registration = await prisma.registration.findFirst({
    where: { ticketViewToken: token },
    select: {
      ticketCode: true,
      firstName: true,
      lastName: true,
      locale: true,
    },
  });

  if (!registration?.ticketCode) {
    notFound();
  }

  return (
    <TicketPageView
      ticketCode={registration.ticketCode}
      ticketViewToken={token}
      firstName={registration.firstName}
      lastName={registration.lastName}
      locale={registration.locale}
    />
  );
}
