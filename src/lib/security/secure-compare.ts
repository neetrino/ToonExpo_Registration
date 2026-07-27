import { createHash, timingSafeEqual } from 'node:crypto';

/**
 * Constant-time equality for secrets (via SHA-256 digests so lengths need not match).
 */
export function secureSecretEqual(left: string, right: string): boolean {
  const leftDigest = createHash('sha256').update(left).digest();
  const rightDigest = createHash('sha256').update(right).digest();
  return timingSafeEqual(leftDigest, rightDigest);
}
