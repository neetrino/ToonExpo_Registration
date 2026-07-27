# Toon Expo Registration — progress and implementation plan

**Updated:** 2026-07-27

**Status:** Phase 1–2 in progress; owner decisions recorded; Peleka SMS deferred

## 1. Current baseline

Implemented:

- multilingual public landing and registration wizard;
- server validation and normalized Neon/Prisma persistence;
- questionnaire storage;
- basic Resend email attempt and status;
- success page with QR + hosted ticket page (`/ticket/<token>`);
- 13-character ticket codes, `sourceSystem=TOON_EXPO`, idempotency key;
- schema expand: ticket/source fields, `DeliveryJob`, `PartnerFeedEvent`, `IntegrationSyncRun`;
- EMAIL `DeliveryJob` + Resend ticket email with inline QR/link + retry dispatcher;
- Mootq inbound POST + Toon Expo-origin cursor feed (`/api/v1/integrations/mootq/registrations`);
- email uniqueness removed (shared email/phone allowed);
- process-local registration IP rate limit removed from public route;
- one-admin list/search/detail/delete/export with source, ticket code, delivery status;
- security baseline and project checks.

Not implemented:

- Peleka SMS (deferred);
- Mootq full import/export + sync history UI;
- attendance sync from Mootq full exchange;
- backfill of legacy rows;
- event-scale rehearsal.

## 2. Agreed scope

- Keep project size A and the current Next.js/Vercel/Neon architecture.
- Each system generates a random 13-character alphanumeric code for registrations created on its own form.
- Codes have no prefix and carry no source meaning.
- Mootq confirmed the format: random 13 characters.
- Toon Expo stores Mootq's exact supplied code unchanged.
- `sourceSystem=TOON_EXPO|MOOTQ` is the only canonical registration-origin marker and is assigned by trusted server routes.
- Toon Expo never replaces or returns a partner ticket code; it only acknowledges storage.
- Toon Expo sends matching email for both sources; SMS via Peleka is deferred.
- Mootq independently controls fast-feed polling frequency.
- Fast exchange carries minimum operational fields.
- Full exchange is manual, paginated and independently initiated by each company.
- Full records carry immutable `sourceSystem` because a full dataset may contain both origins.
- Attendance is initially only `NOT_VISITED` or `VISITED`.
- PostgreSQL delivery jobs provide retry; no external queue or Redis is added.
- Same email and same phone may register multiple participants; protect accidental retries with an idempotency key.
- No visitor block/ban/revoke/soft-delete product workflow; focus is registration and ticket delivery.
- Hosted tickets: `reg.toonexpo.com`. Resend sender: `hi@mail.toonexpo.com` (`mail.toonexpo.com` verified).

## 3. Owner decisions (2026-07-27)

| Topic                         | Decision                                                                 |
| ----------------------------- | ------------------------------------------------------------------------ |
| Repeated email                | Allowed — multiple participants may share one email                      |
| Repeated phone                | Allowed — multiple participants may share one phone                      |
| Accidental double-submit      | Idempotency key (not email/phone uniqueness)                             |
| Email uniqueness constraint   | Remove `(eventId, emailNormalized)` unique in schema expansion           |
| Mootq fast exchange           | Start from draft contract; agree one document with Mootq                 |
| Mootq full sync               | Start from same draft; agree with Mootq                                  |
| Scanner format                | Confirmed by Mootq: random 13 characters                                 |
| Peleka SMS                    | Deferred                                                                 |
| Resend                        | Pro + pay-as-you-go; sender `hi@mail.toonexpo.com`; domain verified      |
| App registration rate limit   | Remove process-local limiter; rely on WAF / existing guards              |
| Email/SMS copy                | Interim designed email OK; SMS short when enabled                        |
| Hosted ticket domain          | `reg.toonexpo.com`                                                       |
| Block/ban/delete product      | Out of scope — registration and delivery only                            |

## 4. Minimal data additions

Planned registration fields:

- `sourceSystem`;
- `sourceRegistrationId` where applicable;
- `ticketCode`;
- `ticketViewToken`;
- `attendanceStatus`;
- public idempotency key storage as needed for retry-safe create.

Planned small supporting tables:

- `DeliveryJob` for EMAIL (and later SMS) retry;
- `PartnerFeedEvent` for ordered Toon Expo-origin fast-feed items;
- `IntegrationSyncRun` for manual full import/export history.

No generic event bus, workflow engine, blocklist or detailed check-in table is planned.

## 5. Safe migration plan

**Framework:** Prisma 7 / PostgreSQL on Neon

**Risk:** MEDIUM–HIGH because existing registrations require code/token backfill and unique constraints. New independent tables and nullable fields are LOW risk. Removing the email unique constraint is an approved behavior change and must be explicit in migration notes.

1. Add nullable fields and independent supporting tables.
2. Deploy code that understands legacy and new rows.
3. Assign `sourceSystem=TOON_EXPO` and generate 13-character codes/ticket tokens for existing rows in bounded batches.
4. Validate exact format, uniqueness and foreign keys.
5. Add unique/required constraints for ticket/source fields in a later migration.
6. Drop unique `(eventId, emailNormalized)` as part of the approved expand path (keep non-unique indexes useful for search).

No production migration is authorized by this plan.

## 6. Delivery phases

### Phase 0 — contracts

- [x] Owner: repeated email and phone allowed; remove email uniqueness.
- [x] Owner: start Mootq fast/full from draft; single partner contract document.
- [x] Mootq confirmed prefixless random 13-character format.
- [x] Resend Pro / pay-as-you-go / sender domain confirmed.
- [x] Hosted ticket domain chosen: `reg.toonexpo.com`.
- [x] Peleka SMS deferred.
- [x] No block/ban/revoke product scope.
- [ ] Assemble and send [`14-MOOTQ-PARTNER-CONTRACT.md`](./technical-specification/14-MOOTQ-PARTNER-CONTRACT.md) for Mootq sign-off.
- [ ] Confirm DNS for `reg.toonexpo.com` at release time.
- [ ] Unblock Peleka when SMS is needed.
- [ ] Replace interim email copy with final marketing text when available.

### Phase 1 — database expansion

- [x] Add nullable source/ticket/token/attendance fields.
- [x] Add `DeliveryJob`, `PartnerFeedEvent` and `IntegrationSyncRun`.
- [x] Drop unique `(eventId, emailNormalized)`; keep search indexes.
- [x] Generate and inspect the migration.
- [x] Test expand migration on representative non-production data.

### Phase 2 — ticket experience

- [x] Generate unique 13-character ticket codes for Toon Expo registrations.
- [ ] Accept and validate immutable Mootq-generated ticket codes.
- [x] Assign origin only from the trusted public/partner server route.
- [x] Public create uses idempotency key for accidental retries.
- [x] Show QR and readable code on Toon Expo success.
- [x] Add private hosted-ticket page and PNG download on `reg.toonexpo.com`.
- [x] Remove process-local registration IP rate limit.
- [ ] Verify representative codes from both generators on actual Mootq scanners.

### Phase 3 — email (SMS later)

- [x] Replace synchronous email with persisted EMAIL delivery jobs.
- [x] Render inline QR, readable code and ticket link in localized email.
- [x] Add bounded retry, provider idempotency and admin-visible failures.
- [x] Defer Peleka SMS adapter until contract is ready.

### Phase 4 — fast exchange

- [x] Implement authenticated idempotent Mootq inbound registration POST.
- [x] Return only appropriate HTTP acknowledgement/errors.
- [x] Implement authenticated incremental Toon Expo-origin cursor feed.
- [ ] Test replay, pagination, catch-up and temporary outage behavior.
- [x] Do not add a polling-frequency switch.
- [ ] Adjust field names after Mootq contract sign-off if needed.

### Phase 5 — full reconciliation

- [ ] Add admin action to import full Mootq data.
- [ ] Expose authenticated paginated full export for Mootq.
- [ ] Upsert by `ticketCode` with source-ID checks.
- [ ] Require and verify `sourceSystem` on every full-sync record.
- [ ] Import minimal attendance status.
- [ ] Store one run history per import/export with counts and bounded errors.
- [ ] Verify safe rerun after partial failure.

### Phase 6 — backfill and rehearsal

- [ ] Backfill existing registrations with `TOON_EXPO` source and 13-character codes/tokens.
- [ ] Validate uniqueness and add final ticket/source constraints.
- [ ] Rehearse 1,000 registrations over ten minutes.
- [ ] Test Resend throttling and backlog recovery.
- [ ] Test Mootq fast-feed polling every three seconds.
- [ ] Run full reconciliation and compare counts.

### Phase 7 — owner-controlled release

- [ ] Complete production checklist.
- [ ] Configure Vercel Pro, paid Neon, Resend; Peleka when unblocked.
- [ ] Exchange scoped Mootq credentials.
- [ ] Apply production migrations manually.
- [ ] Run one Toon Expo-origin and one Mootq-origin end-to-end smoke test.
- [ ] Monitor delivery and integration throughout the event.
- [ ] Run required post-event full synchronization.

## 7. Acceptance summary

- A Toon Expo registration shows and sends the same stored 13-character code.
- A Mootq registration stores and sends the exact supplied 13-character code.
- Admin and synchronization distinguish sources by `sourceSystem`, never by parsing the code.
- Provider failures do not lose a registration or ticket.
- Mootq retries do not create duplicate transport records or repeated logical sends.
- Public accidental retries are idempotent without blocking intentional shared email/phone.
- The Toon Expo-origin fast feed is incremental, replayable and controlled by Mootq polling.
- Full import/export is manual, paginated, rerunnable and recorded in history.
- Shared venue traffic is not blocked by the process-local IP limit.
- No unnecessary backend, broker or cache infrastructure is added.
- SMS may ship after Peleka without changing ticket codes or fast-exchange identity.
