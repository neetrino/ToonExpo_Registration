import { afterEach, describe, expect, it, vi } from 'vitest';
import { createIdleDisconnect } from '@/lib/db/idle-disconnect';

describe('createIdleDisconnect', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('disconnects after idleMs without a later ping', async () => {
    vi.useFakeTimers();
    const disconnect = vi.fn().mockResolvedValue(undefined);
    const idle = createIdleDisconnect({
      idleMs: 5 * 60 * 1000,
      isEnabled: () => true,
      disconnect,
    });

    idle.ping();
    await vi.advanceTimersByTimeAsync(5 * 60 * 1000 - 1);
    expect(disconnect).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(1);
    expect(disconnect).toHaveBeenCalledOnce();
  });

  it('resets the idle window on ping', async () => {
    vi.useFakeTimers();
    const disconnect = vi.fn().mockResolvedValue(undefined);
    const idle = createIdleDisconnect({
      idleMs: 1000,
      isEnabled: () => true,
      disconnect,
    });

    idle.ping();
    await vi.advanceTimersByTimeAsync(900);
    idle.ping();
    await vi.advanceTimersByTimeAsync(900);
    expect(disconnect).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(100);
    expect(disconnect).toHaveBeenCalledOnce();
  });

  it('does nothing when tracking is disabled', async () => {
    vi.useFakeTimers();
    const disconnect = vi.fn().mockResolvedValue(undefined);
    const idle = createIdleDisconnect({
      idleMs: 1000,
      isEnabled: () => false,
      disconnect,
    });

    idle.ping();
    await vi.advanceTimersByTimeAsync(2000);
    expect(disconnect).not.toHaveBeenCalled();
  });
});
