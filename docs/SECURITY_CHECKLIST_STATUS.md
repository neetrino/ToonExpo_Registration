# Security checklist status — Toon Expo Registration

**Updated:** 2026-07-27

Status values: **Done** · **Planned** · **Owner** · **Deferred** · **N/A**

| ID  | Item                       | Status         | Note                                                         |
| --- | -------------------------- | -------------- | ------------------------------------------------------------ |
| 1.1 | HTTPS/HSTS                 | Owner          | Vercel HTTPS; verify HSTS on production domain               |
| 1.2 | WAF/DDoS                   | Owner          | Shared-NAT-safe public ceiling; partner malfunction ceilings |
| 1.3 | Public abuse controls      | Planned        | Remove process-local 5/10m; keep validation/honeypot         |
| 1.4 | Mootq API protection       | Planned        | Separate scoped write and read/export bearer keys            |
| 1.5 | Ticket response privacy    | Planned        | Private/no-store/noindex/restrictive referrer                |
| 2.1 | Admin auth/session         | Done           | Auth.js Credentials, Argon2id, secure cookies                |
| 2.2 | Server-side authorization  | Done           | Existing admin guards                                        |
| 2.3 | Admin MFA                  | Deferred/Owner | Revisit in production risk review                            |
| 3.1 | Public validation          | Done           | Zod, normalization, body bounds, origin, honeypot            |
| 3.2 | Mootq validation           | Planned        | Exact bounded minimal/full schemas and code format           |
| 3.3 | Transport idempotency      | Planned        | Source registration ID plus immutable code checks            |
| 3.4 | Delivery idempotency       | Planned        | Unique registration/channel/template business key            |
| 3.5 | Safe API errors            | Done/Planned   | Extend current generic errors to integrations/tickets        |
| 4.1 | Neon TLS/pooling           | Done/Owner     | Pooled runtime URL; owner validates production plan          |
| 4.2 | DB least privilege         | Owner          | Separate runtime/migration roles                             |
| 4.3 | Backup/PITR                | Owner          | Paid plan and restore rehearsal                              |
| 4.4 | Safe ticket migration      | Planned        | Expand, backfill, validate, then constrain                   |
| 4.5 | Duplicate-email decision   | Owner/blocking | No constraint change before business answer                  |
| 5.1 | Secrets in server env      | Done/Owner     | Separate Preview/Production, no public secrets               |
| 5.2 | Secret rotation            | Planned/Owner  | Mootq/Resend/Peleka rotation procedure                       |
| 6.1 | Redacted logs              | Done/Planned   | Extend to delivery/feed/full sync                            |
| 6.2 | Operational alerts         | Owner          | Registration, delivery, integration and quota failures       |
| 6.3 | No ticket values in logs   | Planned        | Exclude codes/tokens/URLs/raw payloads                       |
| 7.1 | Redis/external broker      | N/A            | Not required; purpose-specific PostgreSQL jobs only          |
| 8.1 | Dependency/security checks | Done/Owner     | CI baseline; patched production dependencies                 |
| 9.1 | Data-sharing agreement     | Owner          | Fast/full field allowlists, purpose and retention            |
| 9.2 | Resend readiness           | Owner          | Domain, pay-as-you-go, quota/rate monitoring                 |
| 9.3 | Peleka readiness           | Owner          | API/auth/sender/throughput/error contract                    |

## Required before implementation completion

1. Repeated-email rule.
2. Mootq minimal inbound, fast-feed and full-sync fixtures.
3. Scanner approval for the prefixless 13-character alphanumeric format.
4. Peleka and Resend production contracts.
5. Expand/backfill/constraint migration tests.
6. Ticket privacy and partner auth negative tests.
7. Shared-IP load, provider failure and integration replay tests.

## Required before production

1. Quality gates pass on patched dependencies.
2. WAF rules promoted from evidence-based Log mode.
3. Neon least-privilege roles and backup/restore rehearsal.
4. Provider/partner secrets exchanged securely.
5. Data-sharing, retention and deletion policy approved.
6. Alerts, incident contacts and post-event sync runbook active.
