# Release acceptance criteria

## Contracts

- [ ] Repeated-email rule is approved and reflected consistently.
- [ ] Mootq minimal inbound, fast feed and full-sync fixtures are approved.
- [ ] `TE…` and `MQ…` ticket codes (`^(TE|MQ)[A-Z0-9]{11}$`) from both generators scan on real devices.
- [ ] Peleka and Resend production contracts/settings are confirmed.

## Toon Expo ticket

- [ ] Accepted Toon Expo registration creates one stored `TE…` ticket code and `sourceSystem=TOON_EXPO`.
- [ ] Success QR, readable text, email and hosted page use the same code.
- [ ] PNG download works.
- [ ] Success does not wait for provider delivery.

## Mootq ticket

- [ ] Mootq-provided `MQ…` ticket code is stored unchanged with `sourceSystem=MOOTQ`.
- [ ] Toon Expo does not return/replace the partner code.
- [ ] Email/hosted page/SMS link use the supplied code.
- [ ] Identical retries create no second transport record or logical send.
- [ ] Conflicting source ID/code returns a safe conflict.

## Delivery

- [ ] EMAIL/SMS jobs persist with the registration/import transaction.
- [ ] Resend inline QR and link render in representative clients.
- [ ] Peleka link opens the correct ticket.
- [ ] Retryable failures recover; terminal failures are visible.
- [ ] Provider throttling does not block registration.

## Fast exchange

- [ ] Feed returns ordered bounded Toon Expo-origin pages with explicit source.
- [ ] Cursor replay/catch-up loses no accepted item.
- [ ] Only approved minimum fields are exposed.
- [ ] Mootq controls polling frequency; Toon Expo has no mode switch.

## Full reconciliation

- [ ] Admin can import full Mootq data.
- [ ] Mootq can independently page through Toon Expo full export.
- [ ] Upsert by `ticketCode` preserves immutable IDs and field ownership.
- [ ] Full pages preserve and validate `sourceSystem` for records from both origins.
- [ ] A code/source mismatch is reported and never silently reclassified.
- [ ] `NOT_VISITED`/`VISITED` imports correctly.
- [ ] Run history records progress/counts/result.
- [ ] Partial failure can be safely rerun.

## Security and admin

- [ ] Public shared-IP load is not blocked by the old in-memory limiter.
- [ ] Partner write/read credentials are scoped and redacted.
- [ ] Ticket routes are private/no-store/noindex.
- [ ] Logs/exports contain no prohibited secrets or tokens.
- [ ] Existing admin features remain functional.
- [ ] Admin source filters/counts use `sourceSystem`, not code parsing.

## Engineering/operations

- [ ] Format, lint, typecheck, tests and production build pass.
- [ ] 1,000 registrations/ten-minute rehearsal passes.
- [ ] Neon pooling/backups and provider quotas are verified.
- [ ] One Toon Expo-origin and one Mootq-origin production smoke flow pass.
- [ ] Post-event full synchronization runbook exists.
