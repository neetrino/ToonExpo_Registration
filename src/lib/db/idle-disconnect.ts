export const DATABASE_IDLE_DISCONNECT_MS = 5 * 60 * 1000;

type IdleDisconnectOptions = {
  idleMs: number;
  isEnabled: () => boolean;
  disconnect: () => Promise<void>;
};

type IdleDisconnectController = {
  ping: () => void;
  clear: () => void;
};

/**
 * After `idleMs` without ping, runs disconnect.
 * `unref()` keeps Next.js from staying alive only for this timer.
 */
export function createIdleDisconnect(options: IdleDisconnectOptions): IdleDisconnectController {
  let timer: ReturnType<typeof setTimeout> | undefined;

  const clear = (): void => {
    if (timer) {
      clearTimeout(timer);
      timer = undefined;
    }
  };

  const ping = (): void => {
    if (!options.isEnabled()) {
      return;
    }

    clear();
    timer = setTimeout(() => {
      timer = undefined;
      void options.disconnect();
    }, options.idleMs);

    timer.unref?.();
  };

  return { ping, clear };
}

export function shouldTrackDatabaseIdle(): boolean {
  return process.env.VERCEL !== '1' && process.env.NODE_ENV !== 'test';
}
