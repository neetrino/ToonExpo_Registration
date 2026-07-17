import 'dotenv/config';
import { defineConfig } from 'prisma/config';

/**
 * CLI datasource URL for migrate/seed.
 * Prefer DIRECT_URL; fall back to DATABASE_URL.
 * Do not use prisma/config `env()` here — it throws when the var is missing,
 * and every CLI command (including `prisma generate`) loads this file.
 */
const cliDatabaseUrl = process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? '';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
  datasource: {
    url: cliDatabaseUrl,
  },
});
