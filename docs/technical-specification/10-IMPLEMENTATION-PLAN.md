# Implementation plan

This sequence delivers only the agreed functionality. Owner decisions from 2026-07-27 are reflected below.

## Phase 0 — contracts

1. ~~Confirm repeated-email behavior.~~ Allowed for email and phone; remove uniqueness constraint; use idempotency key.
2. Draft Mootq fast/full contract in one document and send for sign-off (`14-MOOTQ-PARTNER-CONTRACT.md`).
3. ~~Confirm `TE`/`MQ` prefixed format.~~ Confirmed by Mootq: `^(TE|MQ)[A-Z0-9]{11}$`.
4. ~~Dexatel SMS API.~~ Approved; existing Toon Expo account (`TOONEXPO` sender).
5. ~~Confirm Resend Pro/pay-as-you-go/domain.~~ `hi@mail.toonexpo.com` / `mail.toonexpo.com` verified.
6. Hosted ticket domain: `reg.toonexpo.com` (confirm DNS at release).
7. No block/ban/revoke product scope.

## Phase 1 — expand database

1. Add nullable source/ticket/token/attendance fields.
2. Add `DeliveryJob`, `PartnerFeedEvent`, `IntegrationSyncRun`.
3. Drop unique `(eventId, emailNormalized)`; keep search indexes.
4. Generate and inspect migration SQL.
5. Test expand migration without breaking current registration UX beyond the intentional uniqueness change.

## Phase 2 — ticket foundation

1. Implement a cryptographically secure `TE…` ticket code generator (`TE` + 11 uppercase alphanumeric) and uniqueness retry.
2. Assign `TOON_EXPO`/`MOOTQ` only from trusted server routes.
3. Implement strict validation and unchanged storage for Mootq codes.
4. Implement hosted-ticket token.
5. Public create: idempotency key for accidental retries.
6. Return Toon Expo ticket result to browser.
7. Render success/hosted QR and PNG on `reg.toonexpo.com`.
8. Remove process-local registration IP rate limit.
9. Scan samples from both generators on Mootq hardware.

## Phase 3 — durable email and SMS delivery

1. Create EMAIL jobs in the registration/import transaction.
2. Add bounded PostgreSQL dispatcher.
3. Implement Resend inline QR/link (interim designed copy OK).
4. Add retry/idempotency and basic admin status.
5. Implement Dexatel SMS ticket-link adapter (`DeliveryJob` channel SMS).

## Phase 4 — fast exchange

1. Add scoped Mootq write/read credentials.
2. Implement idempotent minimal Mootq POST with `204`.
3. Implement ordered Toon Expo-origin cursor feed with explicit source.
4. Test retries, conflicts, paging and catch-up.
5. Do not add schedule/mode controls.
6. Rename fields only if Mootq sign-off requires it.

## Phase 5 — full reconciliation

1. Implement `IntegrationSyncRun`.
2. Add admin-triggered import from Mootq.
3. Add partner-triggered paginated Toon Expo export.
4. Upsert by code with immutable source/source-ID/ownership checks.
5. Import attendance enum.
6. Test mixed-origin full pages, source conflicts, partial failure and rerun.

## Phase 6 — backfill/constraints

1. Backfill existing records with `sourceSystem=TOON_EXPO`, `TE…` ticket codes and tokens in bounded batches.
2. Validate nulls/format/uniqueness for ticket/source fields.
3. Add reviewed unique/required constraints for ticket/source fields.
4. Email uniqueness already removed per owner decision.

## Phase 7 — rehearsal and release preparation

1. Run project quality gates.
2. Run agreed load/failure tests.
3. Verify Resend quotas and throttling.
4. Rehearse fast and full exchange with Mootq.
5. Complete the production checklist.
6. Confirm Dexatel SMS production env and sender.

Production deploy/migration remains owner-operated.
