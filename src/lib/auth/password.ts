import * as argon2 from 'argon2';

/**
 * Argon2id parameters per the OWASP Password Storage Cheat Sheet (2024)
 * minimum recommendation: memoryCost 19 MiB, timeCost 2, parallelism 1.
 * Used whenever a new password hash is created (seed script, admin auth
 * module). `argon2.verify` re-reads parameters from the hash itself, so
 * existing hashes created with different parameters keep working.
 */
export const ARGON2_HASH_OPTIONS = {
  type: argon2.argon2id,
  memoryCost: 19_456,
  timeCost: 2,
  parallelism: 1,
} as const;

/**
 * Fixed Argon2id hash of an unrelated dummy password, generated once with
 * `ARGON2_HASH_OPTIONS`. Used only to run a real `argon2.verify` call when no
 * matching admin account exists, so a failed login takes the same amount of
 * time whether the email exists or not (timing side-channel / account
 * enumeration defense). This value never needs to match a real password.
 */
export const DUMMY_PASSWORD_HASH =
  '$argon2id$v=19$m=19456,t=2,p=1$kNdzIoYuim17BJBqR9D/IA$uuz1OZNfUFJrHfT5mXHaZcR4Cv8BGoAzyoSU7x/RJcI';

/**
 * Hash a plaintext password with Argon2id for Admin storage.
 */
export async function hashPassword(plaintext: string): Promise<string> {
  return argon2.hash(plaintext, ARGON2_HASH_OPTIONS);
}

/**
 * Verify a plaintext password against an Argon2id hash.
 */
export async function verifyPassword(hash: string, plaintext: string): Promise<boolean> {
  try {
    return await argon2.verify(hash, plaintext);
  } catch {
    return false;
  }
}

/**
 * Runs `argon2.verify` against `DUMMY_PASSWORD_HASH` so elapsed time matches
 * a real password check. Always resolves to `false`; callers must not use
 * the return value to decide anything other than "this login attempt fails".
 */
export async function verifyDummyPassword(plaintext: string): Promise<false> {
  await verifyPassword(DUMMY_PASSWORD_HASH, plaintext);
  return false;
}
