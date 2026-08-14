import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

export async function getBrandLogoDataUri(): Promise<string> {
  const logo = await readFile(join(process.cwd(), 'public/brand/toon-expo-logo.svg'));
  return `data:image/svg+xml;base64,${logo.toString('base64')}`;
}
