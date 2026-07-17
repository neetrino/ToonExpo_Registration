# Prisma migration notes

## Latest change — `20260717062000_registration_questionnaire`

### Change

Add nullable `Registration.formVersion` (TEXT) and `Registration.answers` (JSONB) for visitor questionnaire storage. No CMS question tables.

### Framework

Prisma 7 + PostgreSQL (Neon). CLI via `DIRECT_URL`; runtime via pooled `DATABASE_URL`.

### Risk classification

**LOW** — additive nullable columns only; existing rows remain valid with `NULL`; no renames, drops, or backfill required for deploy.

### Data and availability risks

None material at current non-prod scale. JSONB add is metadata-only on Postgres for empty/small tables.

### Migration plan

1. Review SQL in `prisma/migrations/20260717062000_registration_questionnaire/migration.sql`.
2. Non-prod only: `pnpm db:migrate:deploy` (or `pnpm db:migrate`).
3. `pnpm prisma:generate` so the client includes the new fields.
4. **Never** apply to production without owner authorization.

### Validation

- `\d "Registration"` shows `formVersion` and `answers`.
- New registrations from API set both fields; legacy rows may be null.
- Unit tests: `src/lib/questionnaire/validate.test.ts`, registration body schema tests.

### Deployment / rollback

- Deploy: `prisma migrate deploy` with migration role + `DIRECT_URL`.
- Rollback (pre-prod): drop the two columns or reset non-prod branch. Prefer forward-fix in shared environments.

### Approval required

Production migrate: **owner only**.
