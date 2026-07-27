# Toon Expo Registration — progress and implementation plan

**Updated:** 2026-07-27

**Status:** implementation plan agreed; duplicate-email rule and external contracts pending

## 1. Current baseline

Implemented:

- multilingual public landing and registration wizard;
- server validation and normalized Neon/Prisma persistence;
- questionnaire storage;
- basic Resend email attempt and status;
- localized success page without QR;
- one-admin list/search/detail/delete/export;
- security baseline and project checks.

Not implemented:

- source/ticket fields and QR rendering;
- hosted ticket page and PNG download;
- durable email/SMS delivery jobs;
- Peleka integration;
- Mootq minimal inbound API;
- incremental Toon Expo-origin feed for Mootq;
- manual full import/export and sync history;
- attendance status;
- event-scale rehearsal.

## 2. Agreed scope

- Keep project size A and the current Next.js/Vercel/Neon architecture.
- Each system generates a random 13-character alphanumeric code for registrations created on its own form.
- Codes have no prefix and carry no source meaning.
- Toon Expo stores Mootq's exact supplied code unchanged.
- `sourceSystem=TOON_EXPO|MOOTQ` is the only canonical registration-origin marker and is assigned by trusted server routes.
- Toon Expo never replaces or returns a partner ticket code; it only acknowledges storage.
- Toon Expo sends matching email and SMS for both sources.
- Mootq independently controls fast-feed polling frequency.
- Fast exchange carries minimum operational fields.
- Full exchange is manual, paginated and independently initiated by each company.
- Full records carry immutable `sourceSystem` because a full dataset may contain both origins.
- Attendance is initially only `NOT_VISITED` or `VISITED`.
- PostgreSQL delivery jobs provide retry; no external queue or Redis is added.

## 3. Blocking decision

The rule for repeated intentional registrations with one email is still open.

Until answered:

- do not remove the current unique `(eventId, emailNormalized)` constraint;
- do not describe email as the permanent cross-system identity;
- use Mootq `sourceRegistrationId` for transport idempotency;
- do not implement automatic cross-source merging.

If repeated email is allowed, accidental retry protection must use an idempotency key rather than email uniqueness.

## 4. Minimal data additions

Planned registration fields:

- `sourceSystem`;
- `sourceRegistrationId` where applicable;
- `ticketCode`;
- `ticketViewToken`;
- `attendanceStatus`.

Planned small supporting tables:

- `DeliveryJob` for EMAIL/SMS retry;
- `PartnerFeedEvent` for ordered Toon Expo-origin fast-feed items;
- `IntegrationSyncRun` for manual full import/export history.

No generic event bus, workflow engine or detailed check-in table is planned.

## 5. Safe migration plan

**Framework:** Prisma 7 / PostgreSQL on Neon

**Risk:** MEDIUM–HIGH because existing registrations require code/token backfill and unique constraints. New independent tables and nullable fields are LOW risk.

1. Add nullable fields and independent supporting tables.
2. Deploy code that understands legacy and new rows.
3. Assign `sourceSystem=TOON_EXPO` and generate 13-character codes/ticket tokens for existing rows in bounded batches.
4. Validate exact format, uniqueness and foreign keys.
5. Add unique/required constraints in a later migration.
6. Decide the email constraint only after the owner answer.

No production migration is authorized by this plan.

## 6. Delivery phases

### Phase 0 — contracts

- [ ] Receive Mootq minimal inbound and fast-feed field agreement.
- [ ] Confirm the prefixless 13-character format on the scanner fixture.
- [ ] Receive Mootq full import/export schemas and authentication details.
- [ ] Confirm whether one email may register multiple participants.
- [ ] Receive Peleka API/auth/idempotency/status documentation.
- [ ] Verify Resend Pro, pay-as-you-go, sender domain and API rate.
- [ ] Approve localized ticket email/SMS copy and production ticket domain.

### Phase 1 — database expansion

- [ ] Add nullable source/ticket/token/attendance fields.
- [ ] Add `DeliveryJob`, `PartnerFeedEvent` and `IntegrationSyncRun`.
- [ ] Generate and inspect the migration.
- [ ] Test expand migration on representative non-production data.

### Phase 2 — ticket experience

- [ ] Generate unique 13-character ticket codes for Toon Expo registrations.
- [ ] Accept and validate immutable Mootq-generated ticket codes.
- [ ] Assign origin only from the trusted public/partner server route.
- [ ] Show QR and readable code on Toon Expo success.
- [ ] Add private hosted-ticket page and PNG download.
- [ ] Verify representative codes from both generators on actual Mootq scanners.

### Phase 3 — email and SMS

- [ ] Replace synchronous email with persisted delivery jobs.
- [ ] Render inline QR, readable code and ticket link in localized email.
- [ ] Integrate Peleka ticket-link SMS.
- [ ] Add bounded retry, provider idempotency and admin-visible failures.

### Phase 4 — fast exchange

- [ ] Implement authenticated idempotent Mootq inbound registration POST.
- [ ] Return only appropriate HTTP acknowledgement/errors.
- [ ] Implement authenticated incremental Toon Expo-origin cursor feed.
- [ ] Test replay, pagination, catch-up and temporary outage behavior.
- [ ] Do not add a polling-frequency switch.

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
- [ ] Validate uniqueness and add final constraints.
- [ ] Rehearse 1,000 registrations over ten minutes.
- [ ] Test Resend/Peleka throttling and backlog recovery.
- [ ] Test Mootq fast-feed polling every three seconds.
- [ ] Run full reconciliation and compare counts.

### Phase 7 — owner-controlled release

- [ ] Complete production checklist.
- [ ] Configure Vercel Pro, paid Neon, Resend and Peleka.
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
- The Toon Expo-origin fast feed is incremental, replayable and controlled by Mootq polling.
- Full import/export is manual, paginated, rerunnable and recorded in history.
- Shared venue traffic is not blocked by the current process-local limit.
- No unnecessary backend, broker or cache infrastructure is added.
