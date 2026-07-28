# Security checklist status — Toon Expo Registration

**Updated:** 2026-07-28

Status values: **Done** · **Planned** · **Owner** · **Deferred** · **N/A**

| ID  | Item                       | Status         | Note                                                         |
| --- | -------------------------- | -------------- | ------------------------------------------------------------ |
| 1.1 | HTTPS/HSTS                 | Owner          | Vercel HTTPS; verify HSTS on `reg.toonexpo.com`              |
| 1.2 | WAF/DDoS                   | Owner          | Shared-NAT-safe public ceiling; partner malfunction ceilings |
| 1.3 | Public abuse controls      | Done/Owner     | Process-local limiter removed; honeypot+origin; WAF required |
| 1.4 | Mootq API protection       | Done           | Separate scoped write and read/export bearer keys            |
| 1.5 | Ticket response privacy    | Done           | Private/no-store/noindex/referrer; handoff without URL token |
| 2.1 | Admin auth/session         | Done           | Auth.js Credentials, Argon2id, secure cookies                |
| 2.2 | Server-side authorization  | Done           | Existing admin guards                                        |
| 2.3 | Admin MFA                  | Deferred/Owner | Revisit in production risk review                            |
| 3.1 | Public validation          | Done           | Zod, normalization, body bounds, origin, honeypot            |
| 3.2 | Mootq validation           | Done           | Strict inbound schema + 13-char code format                  |
| 3.3 | Transport idempotency      | Done           | Source registration ID plus immutable code checks            |
| 3.4 | Delivery idempotency       | Done           | Unique registration/channel/template business key            |
| 3.5 | Safe API errors            | Done           | Generic codes; no ticket/PII in error bodies                 |
| 4.1 | Neon TLS/pooling           | Done/Owner     | Pooled runtime URL; owner validates production plan          |
| 4.2 | DB least privilege         | Owner          | Separate runtime/migration roles                             |
| 4.3 | Backup/PITR                | Owner          | Paid plan and restore rehearsal                              |
| 4.4 | Safe ticket migration      | Done/Planned   | Expand+backfill done; final NOT NULL constraints later       |
| 4.5 | Duplicate-email decision   | Done           | Shared email/phone allowed; idempotency key                  |
| 5.1 | Secrets in server env      | Done/Owner     | Separate Preview/Production, no public secrets               |
| 5.2 | Secret rotation            | Planned/Owner  | Mootq/Resend/Dexatel rotation procedure                      |
| 6.1 | Redacted logs              | Done           | No ticket codes/tokens in app logger fields                  |
| 6.2 | Operational alerts         | Owner          | Registration, delivery, integration and quota failures       |
| 6.3 | No ticket values in logs   | Done           | App logs avoid codes/tokens; sync errors omit ticket codes   |
| 7.1 | Redis/external broker      | N/A            | Not required; purpose-specific PostgreSQL jobs only          |
| 8.1 | Dependency/security checks | Done/Owner     | CI baseline; patched production dependencies                 |
| 9.1 | Data-sharing agreement     | Owner          | Fast/full field allowlists, purpose and retention            |
| 9.2 | Resend readiness           | Owner          | Domain verified; confirm prod `SITE_URL` + monitoring        |
| 9.3 | Dexatel readiness          | Done/Owner     | API verified; Production env set; monitor delivery           |

## Required before production

1. Quality gates pass on patched dependencies.
2. WAF rules promoted from evidence-based Log mode.
3. Neon least-privilege roles and backup/restore rehearsal.
4. Provider/partner secrets exchanged securely + set on Vercel.
5. `SITE_URL=https://reg.toonexpo.com` in Production.
6. Alerts, incident contacts and post-event sync runbook active.
7. Mootq smoke (inbound + feed) when partner is ready.
