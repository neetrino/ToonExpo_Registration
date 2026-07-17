/**
 * Dev/demo seed for Toon Expo Registration MVP.
 *
 * Prerequisites:
 * - DIRECT_URL or DATABASE_URL
 * - For admin: ADMIN_EMAIL + ADMIN_PASSWORD (local only; never commit real secrets)
 *
 * Wire in package.json:
 *   "prisma": { "seed": "tsx prisma/seed.ts" }
 */

import 'dotenv/config';
import { PrismaNeon } from '@prisma/adapter-neon';
import * as argon2 from 'argon2';
import { PrismaClient } from '../src/generated/prisma';

const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('Set DIRECT_URL (preferred) or DATABASE_URL before seeding');
}

const adapter = new PrismaNeon({ connectionString });
const prisma = new PrismaClient({ adapter });

function logInfo(message: string, fields?: Record<string, string | number | boolean>): void {
  if (fields && Object.keys(fields).length > 0) {
    process.stdout.write(`[info] ${message} ${JSON.stringify(fields)}\n`);
  } else {
    process.stdout.write(`[info] ${message}\n`);
  }
}

function logWarn(message: string, fields?: Record<string, string | number | boolean>): void {
  if (fields && Object.keys(fields).length > 0) {
    process.stdout.write(`[warn] ${message} ${JSON.stringify(fields)}\n`);
  } else {
    process.stdout.write(`[warn] ${message}\n`);
  }
}

async function seedEvent(): Promise<void> {
  await prisma.event.upsert({
    where: { slug: 'toon-expo-2026' },
    create: {
      slug: 'toon-expo-2026',
      name: 'Toon Expo 2026',
      startsAt: null,
      venueName: null,
      venueAddress: null,
      isActive: true,
    },
    update: {
      name: 'Toon Expo 2026',
    },
  });
  logInfo('Seeded active event', { slug: 'toon-expo-2026' });
}

/**
 * Upsert one local administrator from ADMIN_EMAIL + ADMIN_PASSWORD.
 * Skips when either env var is missing (safe for CI / shared pipelines).
 */
async function seedAdmin(): Promise<void> {
  const emailRaw = process.env.ADMIN_EMAIL?.trim();
  const password = process.env.ADMIN_PASSWORD;

  if (!emailRaw || !password) {
    logWarn('Skipping admin seed: set ADMIN_EMAIL and ADMIN_PASSWORD for local admin creation');
    return;
  }

  if (password.length < 12) {
    throw new Error('ADMIN_PASSWORD must be at least 12 characters');
  }

  const email = emailRaw.toLowerCase();
  const passwordHash = await argon2.hash(password, { type: argon2.argon2id });

  await prisma.admin.upsert({
    where: { email },
    create: {
      email,
      passwordHash,
      role: 'ADMIN',
      isActive: true,
    },
    update: {
      passwordHash,
      role: 'ADMIN',
      isActive: true,
    },
  });

  logInfo('Seeded admin account', { email });
}

async function main(): Promise<void> {
  await seedEvent();
  await seedAdmin();
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
