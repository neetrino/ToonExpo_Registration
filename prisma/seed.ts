/**
 * Dev/demo seed for Toon Expo Registration MVP.
 *
 * Prerequisites (foundation agent):
 * - Install prisma, @prisma/client, @prisma/adapter-neon, dotenv, tsx, argon2
 * - Create root prisma.config.ts with DIRECT_URL
 * - Run `pnpm prisma generate` then `pnpm prisma db seed`
 *
 * Wire in package.json when available:
 *   "prisma": { "seed": "tsx prisma/seed.ts" }
 *
 * DO NOT commit real admin credentials or production password hashes.
 */

import 'dotenv/config'
import { PrismaNeon } from '@prisma/adapter-neon'
import { PrismaClient } from '../src/generated/prisma'

const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL

if (!connectionString) {
  throw new Error('Set DIRECT_URL (preferred) or DATABASE_URL before seeding')
}

const adapter = new PrismaNeon({ connectionString })
const prisma = new PrismaClient({ adapter })

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
  })
}

/**
 * Admin seed is intentionally stubbed until argon2 is available in the app.
 *
 * TODO(foundation): after installing `argon2`, hash a local-only password and upsert:
 *
 *   const passwordHash = await argon2.hash(process.env.SEED_ADMIN_PASSWORD!, {
 *     type: argon2.argon2id,
 *   })
 *   await prisma.admin.upsert({
 *     where: { email: 'admin@example.com' },
 *     create: {
 *       email: 'admin@example.com',
 *       passwordHash,
 *       role: 'ADMIN',
 *       isActive: true,
 *     },
 *     update: {},
 *   })
 *
 * Never invent or commit a real password. Use env (e.g. SEED_ADMIN_PASSWORD)
 * only for local/dev seed; omit Admin seed in production pipelines.
 */
async function seedAdminPlaceholder(): Promise<void> {
  // no-op — see TODO above
}

async function main(): Promise<void> {
  await seedEvent()
  await seedAdminPlaceholder()
}

main()
  .catch((error: unknown) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
