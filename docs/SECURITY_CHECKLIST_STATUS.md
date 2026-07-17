# Security checklist status — Toon Expo Registration

**Updated:** 2026-07-17  
**Sources:** `docs/reference/Check/Security/0 Security List.md`, `docs/technical-specification/07-SECURITY-AND-PRIVACY.md`, `docs/TECH_CARD.md`

Status values: **Done** (code closed) · **N/A** · **Owner** (manual panel/policy) · **Deferred** (post-MVP or pending environment)

| ID | Item | Status | Note |
|---|---|---|---|
| **1.1** | HTTPS + HSTS | Owner | Vercel HTTPS by default; enable HSTS after production domain is confirmed |
| **1.2** | WAF managed rules | Owner | Use **Vercel WAF** (not Cloudflare) for this project; publish before production |
| **1.3** | DDoS protection | Owner | Rely on Vercel platform DDoS; no Cloudflare layer in MVP |
| **1.4** | Rate limit registration/auth | Owner | TECH_CARD: Vercel WAF rate-limit on registration mutation only; login has in-memory throttle (single-instance) |
| **1.5** | Security headers | Done | `next.config.ts`: nosniff, X-Frame-Options DENY, Referrer-Policy, Permissions-Policy, pragmatic CSP (`script-src`/`style-src` allow `'unsafe-inline'` for Next.js) |
| **2.1** | Auth ADR | Done | Documented in TECH_CARD §5 + technical specification (Auth.js, one admin) |
| **2.2** | Secure cookies + session TTL | Done | Auth.js JWT, 8h maxAge, 1h updateAge, HTTP-only / SameSite=Lax / Secure in production |
| **2.3** | CSRF protection | Done | Registration Origin/Referer allowlist; Next.js Server Actions origin checks; Auth.js CSRF on `/api/auth/*` |
| **2.4** | RBAC server-side | Done | Admin session + `ADMIN` role checked on pages, actions, and CSV export |
| **2.5** | Admin MFA mandatory | Owner / Deferred | Post-MVP or OAuth allowlist per TECH_CARD; not in MVP credentials flow |
| **2.6** | Password policy | Done / Owner | Seed requires ≥12 chars locally; owner must set a strong unique password via secure channel |
| **2.7** | Logout invalidates session | Done | `signOut()` clears Auth.js session cookie |
| **3.1** | Input validation | Done | Zod schemas on registration body and admin credentials |
| **3.1a** | XSS / no unsafe HTML | Done | No `dangerouslySetInnerHTML` with user data; React text escaping |
| **3.2** | No stack traces in prod | Done | API errors return `{ ok, code, requestId }` only |
| **3.2a** | No sensitive data in errors | Done | Generic auth/registration/admin error messages; no DB/provider details |
| **3.3** | Strict CORS / origin | Done | No wildcard CORS; production requires matching Origin or Referer vs `SITE_URL` |
| **3.4** | Idempotency for critical POST | Deferred | Unique email-per-event constraint covers duplicate registration; no Idempotency-Key header in MVP |
| **3.5** | Webhook signature | N/A | No inbound webhooks |
| **3.6** | Parameterized queries | Done | Prisma only; no string-concatenated SQL |
| **4.1** | DB TLS required | Owner | Use `sslmode=require` in Neon URLs (see `.env.example`) |
| **4.2** | DB pooling + limits | Done | Neon pooled `DATABASE_URL` + Prisma adapter; adaptive limits still owner-validated under load |
| **4.3** | DB least privilege | Owner | Separate runtime vs migration roles; apply least-privilege SQL on Neon before production |
| **4.4** | Backups + restore test | Owner | Neon PITR/backups; run a restore drill before production |
| **5.1** | Secrets only in env | Owner | Configure Preview vs Production separately in Vercel; never `NEXT_PUBLIC_` for secrets |
| **5.2** | Rotation runbook | Owner | Document/run rotation if a secret leaks (see privacy/security spec) |
| **5.3** | `.env` gitignored / no secrets in code | Done | `.env` / `.env.*` ignored except `.env.example`; spot-check clean |
| **6.1** | Logs + request-id | Done | `x-request-id` on registration + admin export; requestId on admin delete/login-fail logs |
| **6.2** | Alerts for 5xx/latency | Owner | Configure Vercel (or later Sentry) alerts before production |
| **6.3** | No tokens/PII in logs | Done | Logs use requestId/codes/registrationId; no full email/phone/passwords |
| **7.1–7.3** | Redis / Upstash | N/A | Redis not used in MVP |
| **8.1** | Dependency scanning in CI | Done / Owner | CI runs informational `pnpm audit --prod --audit-level=high`; enable Dependabot alerts in GitHub |

## Remaining owner actions (before production)

1. Publish **Vercel WAF** rate limit on `POST /api/registrations`.
2. Confirm production domain → HTTPS + **HSTS**.
3. Neon: TLS URLs, **least-privilege** runtime role, backup/restore drill.
4. Vercel env separation (Preview ≠ Production DB/Resend) and secret rotation awareness.
5. Enable **Dependabot** (or Renovate) alerts/PRs.
6. Configure **5xx/latency alerts** (Vercel and/or Sentry).
7. Decide MFA path post-MVP (**2.5**).
8. Set a strong unique admin password via a secure channel (never chat/git).

## CSP note

Baseline CSP allows `'unsafe-inline'` for `script-src` and `style-src` so Next.js App Router and inline styles keep working. Tighten with nonces/hashes in a later hardening pass if needed.
