const TICKET_HANDOFF_KEY = 'toon-expo-ticket-handoff-v1';

export type TicketHandoff = {
  ticketCode: string;
  ticketViewToken: string;
};

/**
 * In-memory mirror so React Strict Mode remounts (dev double useEffect)
 * do not lose a one-shot sessionStorage handoff after the first take.
 * Resets on full page reload; storeTicketHandoff clears it for a new registration.
 */
let takenHandoff: TicketHandoff | null | undefined;

/** Clears in-memory take cache. Used by unit tests only. */
export function resetTicketHandoffForTests(): void {
  takenHandoff = undefined;
}

function parseHandoff(raw: string): TicketHandoff | null {
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
}

/**
 * Store ticket handoff in sessionStorage so success UI never needs tokens in the URL.
 */
export function storeTicketHandoff(handoff: TicketHandoff): void {
  // Keep memory immediately so Soft Navigation + Strict Mode remounts never race storage.
  takenHandoff = handoff;

  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.sessionStorage.setItem(TICKET_HANDOFF_KEY, JSON.stringify(handoff));
  } catch {
    // Ignore quota / private mode failures; in-memory handoff still works for this tab.
  }
}

/**
 * Read and clear a one-shot ticket handoff for the success page.
 * Safe under React Strict Mode: the first successful take is cached in memory
 * for subsequent mounts in the same JS realm.
 */
export function takeTicketHandoff(): TicketHandoff | null {
  if (takenHandoff !== undefined && takenHandoff !== null) {
    if (typeof window !== 'undefined') {
      try {
        window.sessionStorage.removeItem(TICKET_HANDOFF_KEY);
      } catch {
        // Ignore.
      }
    }
    return takenHandoff;
  }

  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const raw = window.sessionStorage.getItem(TICKET_HANDOFF_KEY);
    window.sessionStorage.removeItem(TICKET_HANDOFF_KEY);
    takenHandoff = raw ? parseHandoff(raw) : null;
    return takenHandoff;
  } catch {
    takenHandoff = null;
    return null;
  }
}
