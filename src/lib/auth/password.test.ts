import { describe, expect, it } from 'vitest';
import {
  ARGON2_HASH_OPTIONS,
  DUMMY_PASSWORD_HASH,
  hashPassword,
  verifyDummyPassword,
  verifyPassword,
} from '@/lib/auth/password';

describe('ARGON2_HASH_OPTIONS', () => {
  it('matches the OWASP minimum recommendation', () => {
    expect(ARGON2_HASH_OPTIONS.memoryCost).toBe(19_456);
    expect(ARGON2_HASH_OPTIONS.timeCost).toBe(2);
    expect(ARGON2_HASH_OPTIONS.parallelism).toBe(1);
  });
});

describe('DUMMY_PASSWORD_HASH', () => {
  it('is a valid argon2id hash using ARGON2_HASH_OPTIONS parameters', () => {
    expect(DUMMY_PASSWORD_HASH).toMatch(
      /^\$argon2id\$v=19\$m=19456,t=2,p=1\$/,
    );
  });

  it('never verifies successfully against any plaintext', async () => {
    expect(await verifyPassword(DUMMY_PASSWORD_HASH, 'any-password')).toBe(false);
    expect(await verifyPassword(DUMMY_PASSWORD_HASH, '')).toBe(false);
  });
});

describe('verifyDummyPassword', () => {
  it('always resolves to false while still running a real argon2 verify', async () => {
    expect(await verifyDummyPassword('whatever-the-user-typed')).toBe(false);
  });
});

describe('hashPassword', () => {
  it('produces a hash usable by verifyPassword with the configured parameters', async () => {
    const hash = await hashPassword('correct-horse-battery-staple');
    expect(hash).toMatch(/^\$argon2id\$v=19\$m=19456,t=2,p=1\$/);
    expect(await verifyPassword(hash, 'correct-horse-battery-staple')).toBe(true);
    expect(await verifyPassword(hash, 'wrong-password')).toBe(false);
  });
});
