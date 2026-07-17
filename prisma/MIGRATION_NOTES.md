# Prisma migration notes (MVP)

## Change

Greenfield MVP schema: `Event`, `Registration`, `Admin` (+ enums). Hard delete for registrations (no `deletedAt`). No questionnaire entities.

## Framework

Prisma 7 + PostgreSQL (Neon). CLI migrations via `DIRECT_URL`; runtime queries via pooled `DATABASE_URL` + `@prisma/adapter-neon`.

## Risk classification

**LOW** — empty / new database, additive tables only, no existing production data, no renames or destructive alters.

## Data and availability risks

None for greenfield. After first production data exists, re-classify any follow-up migrations.

## Migration plan

Initial SQL is already under `prisma/migrations/20260717054700_init_mvp/` (hand-authored; includes partial unique `Event_one_active_idx`). **Not applied** in this pass.

1. Add root `prisma.config.ts` (foundation owns repo root):

```ts
import 'dotenv/config'
import { defineConfig, env } from 'prisma/config'

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: env('DIRECT_URL'),
  },
})
```

2. Install packages (see below).
3. Local/non-prod only:

```bash
pnpm prisma migrate dev
# or: pnpm prisma migrate deploy
```

4. If Prisma regenerates and drops the partial unique index, re-add:

```sql
CREATE UNIQUE INDEX "Event_one_active_idx"
  ON "Event" ("isActive")
  WHERE "isActive" = true;
```

**Never** apply to production as part of scaffolding.

## Validation

- `\d` / Prisma Studio: three tables, unique `(eventId, emailNormalized)`, list index `(eventId, createdAt, id)`, search indexes on normalized email/phone per event.
- Confirm partial unique: second `isActive = true` insert/update fails.
- Seed: `pnpm prisma db seed` creates `toon-expo-2026` event.

## Deployment / rollback

- Deploy: `prisma migrate deploy` with migration role + `DIRECT_URL` (manual owner action per TECH_CARD).
- Rollback (pre-data): drop tables / reset branch. Post-data: forward-fix only; do not drop participant tables casually.

## Approval required

Production migration apply: **owner only**. This delivery does not apply migrations.

## Required packages (foundation agent)

| Package | Role |
|---|---|
| `prisma` (dev) | CLI, migrate, generate |
| `@prisma/client` | Generated client peer |
| `@prisma/adapter-neon` | Neon serverless adapter (bundles driver) |
| `dotenv` | Load `.env` for CLI/seed |
| `tsx` (dev) | Run `prisma/seed.ts` |
| `argon2` | Admin password hash at seed/runtime (Auth.js) |

Seed script wiring:

```json
"prisma": {
  "seed": "tsx prisma/seed.ts"
}
```

## Remaining risk

- Partial unique index must be added manually to the first migration SQL or Prisma will not enforce single-active-event at DB level (app guard still required in comments).
- `prisma.config.ts` and `package.json` are owned by the foundation agent; schema alone cannot run migrate until those exist.
- Client output path is `src/generated/prisma` — ensure that directory is gitignored appropriately by foundation.
- Hand-written migration may diverge slightly from `prisma migrate diff` output once `prisma.config.ts` exists; reconcile on first local `migrate dev` if needed.
- Migration was **not applied** to any database in this pass.
