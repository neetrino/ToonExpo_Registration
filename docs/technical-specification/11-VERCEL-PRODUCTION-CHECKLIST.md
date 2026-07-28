# Manual production checklist

Owner/operator actions only. Documentation or implementation work does not authorize production deployment or migration.

## Decisions and contracts

- [ ] Repeated-email rule approved.
- [ ] `TE`/`MQ` prefixed format (`^(TE|MQ)[A-Z0-9]{11}$`) and scanner test approved.
- [ ] Mootq minimal inbound/fast/full schemas and credentials approved.
- [ ] Fast-feed name/email/phone purpose and retention approved.
- [ ] Dexatel API, sender (`TOONEXPO`), throughput and errors approved.
- [ ] Resend Pro/pay-as-you-go/sender domain confirmed.
- [ ] Data sharing, retention and deletion approved.

## Vercel and Neon

- [ ] Vercel Pro production project configured.
- [ ] Node.js 24 and supported patched Next.js/React versions.
- [ ] Function and Neon regions colocated.
- [ ] Paid Neon plan, pooled runtime URL and direct migration URL.
- [ ] Backup/PITR and restore test completed.
- [ ] Database/runtime roles follow least privilege.

## Secrets

- [ ] Production admin/Auth secret.
- [ ] Resend API key/from address.
- [ ] Dexatel credentials (`DEXATEL_API_KEY`, `DEXATEL_SMS_FROM`).
- [ ] Separate Mootq write and read/export credentials.
- [ ] Preview credentials/resources separate from Production.
- [ ] No secret uses a `NEXT_PUBLIC_` variable.

## Database release

- [ ] Expand migration tested from the current schema.
- [ ] Existing row count/sample backed up.
- [ ] Backfill tested in bounded batches.
- [ ] Ticket/source uniqueness validated.
- [ ] Required constraints applied only after validation.
- [ ] Email constraint matches the approved business rule.
- [ ] Forward-fix/rollback procedure documented.

## WAF and API

- [ ] Process-local registration limiter removed.
- [ ] Public WAF ceiling tested in Log mode with shared-IP load.
- [ ] Mootq inbound/feed safety ceilings exceed legitimate traffic.
- [ ] Ticket/full-sync endpoints are no-store and authenticated as applicable.
- [ ] Partner negative-auth, replay and oversized-body tests pass.

## Resend and Dexatel

- [ ] Resend SPF/DKIM/DMARC verified.
- [ ] Pay-as-you-go status checked in the active account.
- [ ] Quota/rate alerts configured.
- [ ] Representative email clients show QR/link/code.
- [ ] Dexatel test SMS opens the correct ticket.
- [ ] Provider timeout/429/permanent-error paths tested.
- [ ] Delivery backlog/retry visibility works.

## Mootq rehearsal

- [ ] Toon Expo-origin code reaches Mootq fast feed with explicit source and scans.
- [ ] Mootq-origin code reaches Toon Expo unchanged with `sourceSystem=MOOTQ` and sends.
- [ ] Identical Mootq retry is safe.
- [ ] Feed catches up from an old cursor.
- [ ] Mootq controls polling cadence without Toon Expo configuration.
- [ ] Full import from Mootq succeeds and reruns safely.
- [ ] Mootq independently completes a Toon Expo full export.
- [ ] Attendance status imports correctly.

## Load and observability

- [ ] Rehearse 1,000 registrations/ten minutes with mixed sources.
- [ ] Monitor Vercel errors/latency/invocations.
- [ ] Monitor Neon connections/CPU/query latency.
- [ ] Monitor delivery backlog/provider errors/quota.
- [ ] Monitor Mootq inbound conflicts and sync-run results.
- [ ] Incident contacts/runbook agreed.

## Release and event

- [ ] Production migrations applied manually.
- [ ] One Toon Expo-origin and one Mootq-origin end-to-end smoke test.
- [ ] WAF Enforce only after evidence shows no false positives.
- [ ] Monitor launch and event peaks.
- [ ] Preserve manual resend/import recovery paths.
- [ ] Run and record the required post-event full synchronization.
