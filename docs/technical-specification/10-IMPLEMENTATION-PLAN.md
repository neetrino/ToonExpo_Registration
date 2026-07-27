# Implementation plan

This sequence delivers only the agreed functionality and keeps open decisions from leaking into schema/code.

## Phase 0 — unblock contracts

1. Confirm repeated-email behavior.
2. Receive Mootq minimal inbound/fast/full fixtures.
3. Confirm a prefixless 13-character alphanumeric scanner sample.
4. Receive Peleka API details.
5. Confirm Resend Pro/pay-as-you-go/domain.

## Phase 1 — expand database

1. Add nullable source/ticket/token/attendance fields.
2. Add `DeliveryJob`, `PartnerFeedEvent`, `IntegrationSyncRun`.
3. Generate and inspect migration SQL.
4. Test expand migration without changing current behavior.

## Phase 2 — ticket foundation

1. Implement a cryptographically secure 13-character alphanumeric generator and uniqueness retry.
2. Assign `TOON_EXPO`/`MOOTQ` only from trusted server routes.
3. Implement strict validation and unchanged storage for Mootq codes.
4. Implement hosted-ticket token.
5. Return Toon Expo ticket result to browser.
6. Render success/hosted QR and PNG.
7. Scan samples from both generators on Mootq hardware.

## Phase 3 — durable delivery

1. Create EMAIL/SMS jobs in the registration/import transaction.
2. Add bounded PostgreSQL dispatcher.
3. Implement Resend inline QR/link.
4. Implement Peleka link SMS.
5. Add retry/idempotency and basic admin status.

## Phase 4 — fast exchange

1. Add scoped Mootq write/read credentials.
2. Implement idempotent minimal Mootq POST with `204`.
3. Implement ordered Toon Expo-origin cursor feed with explicit source.
4. Test retries, conflicts, paging and catch-up.
5. Do not add schedule/mode controls.

## Phase 5 — full reconciliation

1. Implement `IntegrationSyncRun`.
2. Add admin-triggered import from Mootq.
3. Add partner-triggered paginated Toon Expo export.
4. Upsert by code with immutable source/source-ID/ownership checks.
5. Import attendance enum.
6. Test mixed-origin full pages, source conflicts, partial failure and rerun.

## Phase 6 — backfill/constraints

1. Backfill existing records with `sourceSystem=TOON_EXPO`, 13-character codes and tokens in bounded batches.
2. Validate nulls/format/uniqueness.
3. Add reviewed unique/required constraints.
4. Apply the approved repeated-email decision separately.

## Phase 7 — rehearsal and release preparation

1. Run project quality gates.
2. Run agreed load/failure tests.
3. Verify Resend/Peleka quotas and throttling.
4. Rehearse fast and full exchange with Mootq.
5. Complete the production checklist.

Production deploy/migration remains owner-operated.
