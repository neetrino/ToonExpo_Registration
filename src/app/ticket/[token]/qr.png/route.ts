import { notFound } from 'next/navigation';
import { getPrisma } from '@/lib/db/prisma';
import { renderTicketQrPng } from '@/lib/tickets/qr';

export const dynamic = 'force-dynamic';

type QrRouteProps = {
  params: Promise<{ token: string }>;
};

/**
 * On-demand QR PNG for a hosted ticket token. Payload is exactly ticketCode.
 */
export async function GET(_request: Request, { params }: QrRouteProps): Promise<Response> {
  const { token } = await params;
  if (!token || token.length < 20) {
    notFound();
  }

  const prisma = getPrisma();
  const registration = await prisma.registration.findFirst({
    where: { ticketViewToken: token },
    select: { ticketCode: true },
  });

  if (!registration?.ticketCode) {
    notFound();
  }

  const png = await renderTicketQrPng(registration.ticketCode);

  return new Response(new Uint8Array(png), {
    status: 200,
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'private, no-store, max-age=0, must-revalidate',
      'X-Robots-Tag': 'noindex, nofollow',
      'Content-Disposition': `inline; filename="toon-expo-ticket-${registration.ticketCode}.png"`,
      'Referrer-Policy': 'no-referrer',
    },
  });
}
