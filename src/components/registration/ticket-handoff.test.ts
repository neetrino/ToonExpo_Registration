import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  resetTicketHandoffForTests,
  storeTicketHandoff,
  takeTicketHandoff,
} from './ticket-handoff';

const sample = {
  ticketCode: 'TEABCDEFGHIJK',
  ticketViewToken: 'a'.repeat(32),
};

describe('ticket-handoff', () => {
  const store = new Map<string, string>();

  beforeEach(() => {
    store.clear();
    resetTicketHandoffForTests();
    vi.stubGlobal('sessionStorage', {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => {
        store.set(key, value);
      },
      removeItem: (key: string) => {
        store.delete(key);
      },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    resetTicketHandoffForTests();
  });

  it('stores and takes a handoff once from sessionStorage', () => {
    storeTicketHandoff(sample);
    expect(takeTicketHandoff()).toEqual(sample);
    expect(store.size).toBe(0);
  });

  it('returns the same handoff on a second take (Strict Mode remount)', () => {
    storeTicketHandoff(sample);
    const first = takeTicketHandoff();
    const second = takeTicketHandoff();
    expect(first).toEqual(sample);
    expect(second).toEqual(sample);
  });

  it('allows a new registration to replace the previous handoff', () => {
    storeTicketHandoff(sample);
    takeTicketHandoff();

    const next = {
      ticketCode: 'TE12345678901',
      ticketViewToken: 'b'.repeat(32),
    };
    storeTicketHandoff(next);
    expect(takeTicketHandoff()).toEqual(next);
  });

  it('keeps handoff in memory even before take when sessionStorage works', () => {
    storeTicketHandoff(sample);
    expect(takeTicketHandoff()).toEqual(sample);
    expect(takeTicketHandoff()).toEqual(sample);
  });

  it('falls back to memory when sessionStorage throws on store', () => {
    vi.stubGlobal('sessionStorage', {
      getItem: () => {
        throw new Error('blocked');
      },
      setItem: () => {
        throw new Error('blocked');
      },
      removeItem: () => {
        throw new Error('blocked');
      },
    });

    storeTicketHandoff(sample);
    expect(takeTicketHandoff()).toEqual(sample);
  });
});
