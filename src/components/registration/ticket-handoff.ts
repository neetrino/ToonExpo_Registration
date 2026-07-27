const TICKET_HANDOFF_KEY = 'toon-expo-ticket-handoff-v1';

export type TicketHandoff = {
  ticketCode: string;
  ticketViewToken: string;
};

/**
 * Store ticket handoff in sessionStorage so success UI never needs tokens in the URL.
 */
export function storeTicketHandoff(handoff: TicketHandoff): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.sessionStorage.setItem(TICKET_HANDOFF_KEY, JSON.stringify(handoff));
  } catch {
    // Ignore quota / private mode failures.
  }
}

/**
 * Read and clear a one-shot ticket handoff for the success page.
 */
export function takeTicketHandoff(): TicketHandoff | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const raw = window.sessionStorage.getItem(TICKET_HANDOFF_KEY);
    window.sessionStorage.removeItem(TICKET_HANDOFF_KEY);
    if (!raw) {
      return null;
    }

    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') {
      return null;
    }

    const candidate = parsed as Partial<TicketHandoff>;
    if (
      typeof candidate.ticketCode !== 'string' ||
      typeof candidate.ticketViewToken !== 'string' ||
      candidate.ticketViewToken.length < 20
    ) {
      return null;
    }

    return {
      ticketCode: candidate.ticketCode,
      ticketViewToken: candidate.ticketViewToken,
    };
  } catch {
    return null;
  }
}
