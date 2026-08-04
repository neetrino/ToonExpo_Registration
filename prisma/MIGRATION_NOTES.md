# Prisma migration notes

## Latest change — `20260804120000_registration_utm_attribution`

### Change

Add nullable marketing attribution columns on `Registration`:

- `utmSource` (TEXT, nullable)
- `utmMedium` (TEXT, nullable)
- `utmCampaign` (TEXT, nullable)

Captured from landing UTM query params on public registration; no backfill required.

### Framework

Prisma 7 + PostgreSQL (Neon). CLI via `DIRECT_URL`; runtime via pooled `DATABASE_URL`.

### Risk classification

**LOW** — additive nullable columns only; no indexes, constraints, rewrites, or data backfill.

### Data and availability risks

- Existing rows remain valid with NULL UTM fields.
- Rolling deploy: old app ignores new columns; new app writes them when present.
- No lock risk beyond a brief metadata ALTER on Neon/Postgres for small additive columns.

### Migration plan

1. Review SQL in `prisma/migrations/20260804120000_registration_utm_attribution/migration.sql`.
2. Non-prod only: `pnpm db:migrate:deploy` (or `pnpm db:migrate`).
3. `pnpm prisma:generate`.
4. **Never** apply to production without owner authorization.

### Validation

- Columns exist and are nullable.
- New public registrations persist UTM when submitted; admin list/detail/CSV and Mootq push/feed/export surface them when set.

### Deployment / rollback

- Deploy: `prisma migrate deploy` with migration role + `DIRECT_URL`, then application that writes/reads UTM.
- Rollback: prefer forward-fix (stop writing UTM); dropping columns is a later contract step only after consumers stop reading them.

### Approval required

Production migrate: **owner only**.

---

## Previous — `20260727120000_ticketing_and_integrations`

### Change

Expand schema for ticketing and Mootq integration:

- nullable `Registration` fields: `sourceSystem`, `sourceRegistrationId`, `ticketCode`, `ticketViewToken`, `attendanceStatus`, `idempotencyKey`;
- drop unique `(eventId, emailNormalized)` (owner: repeated email/phone allowed); keep search index;
- add `DeliveryJob`, `PartnerFeedEvent`, `IntegrationSyncRun`.

Does **not** backfill ticket codes/tokens or add NOT NULL constraints (Phase 6).

### Framework

Prisma 7 + PostgreSQL (Neon). CLI via `DIRECT_URL`; runtime via pooled `DATABASE_URL`.

### Risk classification

**MEDIUM** — additive nullable columns/tables are low risk; dropping email uniqueness is an intentional approved behavior change. Ticket unique indexes allow multiple NULLs for legacy rows until backfill.

### Data and availability risks

- Existing rows remain valid with NULL ticket/source fields until backfill.
- After deploy, new registrations must write ticket fields; legacy rows without codes are not yet scanner-ready.
- Email uniqueness no longer enforced at DB — application must use idempotency keys for accidental retries.

### Migration plan

1. Review SQL in `prisma/migrations/20260727120000_ticketing_and_integrations/migration.sql`.
2. Non-prod only: `pnpm db:migrate:deploy` (or `pnpm db:migrate`).
3. `pnpm prisma:generate`.
4. **Never** apply to production without owner authorization.

### Validation

- New enums and tables exist; email unique index gone; email search index present.
- New registrations set `sourceSystem`, `ticketCode`, `ticketViewToken`.
- Duplicate intentional emails succeed; same idempotency key returns the prior registration.

### Deployment / rollback

- Deploy: `prisma migrate deploy` with migration role + `DIRECT_URL`.
- Rollback (pre-prod): restore email unique only after clearing intentional duplicates; prefer forward-fix in shared environments.

### Approval required

Production migrate: **owner only**.

---

## Previous — `20260717062000_registration_questionnaire`

### Change

Add nullable `Registration.formVersion` (TEXT) and `Registration.answers` (JSONB) for visitor questionnaire storage. No CMS question tables.

### Risk classification

**LOW** — additive nullable columns only.
