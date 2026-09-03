import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

const BRAND_LOGO_FILES = {
  color: 'public/brand/toon-expo-logo-pill.png',
  inverted: 'public/brand/toon-expo-logo-over-hero.png',
} as const;

/**
 * Embeds the official lockup for OG images and generated app icons.
 */
export async function getBrandLogoDataUri(
  variant: keyof typeof BRAND_LOGO_FILES = 'inverted',
): Promise<string> {
  const logo = await readFile(join(process.cwd(), BRAND_LOGO_FILES[variant]));
  return `data:image/png;base64,${logo.toString('base64')}`;
}
