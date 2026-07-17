# Toon Expo Registration — progress

**Updated:** 2026-07-17

| Phase | Status | Notes |
|---|---|---|
| Product intake and scope | Complete | Core MVP, size A, languages and stack approved |
| Technical specification | Complete | See `docs/technical-specification/` |
| Final event content/assets | Pending | Date, venue, final translations, legal text and source assets required |
| Application foundation | Complete (Phase 1) | Next.js scaffold, locale routes, tokens, i18n, env schema, CI baseline |
| Database and registration | Phase 2 + questionnaire | Prisma fields + typed answers API; wizard UI pending |
| Landing and localization | Phase 3 UI done | Branded landing + form; questionnaire wizard UI pending |
| Email confirmation | Phase 4 done | Localized hy/en/ru text+HTML via Resend fetch; commit-first; placeholder key → FAILED safely |
| Admin dashboard | Phase 5 done | Auth.js credentials, list/search/delete/CSV; English UI pending owner language |
| Security hardening (mid-dev) | Done (code 🤖) | Headers, origin tighten, request-id, audit CI gate; see `docs/SECURITY_CHECKLIST_STATUS.md` |
| Verification/load testing | Not started | Preview environment only |
| Production setup/release | Not started | Owner-operated; no deployment authorized yet |

## Phase 1 — Application foundation (complete)

- [x] `package.json`, TypeScript strict, Next.js 16 App Router, Tailwind CSS 4
- [x] Public locale routes: landing, privacy, success (`hy` default, `en`, `ru`)
- [x] Admin route stubs: `/admin/login`, `/admin`
- [x] Toon Expo design tokens in `globals.css`
- [x] Minimal shadcn/ui primitives: button, input, label
- [x] next-intl wiring and placeholder message catalogs
- [x] Zod env validation (`src/lib/env.ts`)
- [x] Quality scripts: format, lint, typecheck, test, build
- [x] GitHub Actions CI baseline

## Phase 2 — Database and registration (core)

- [x] Prisma 7 packages: `prisma`, `@prisma/client`, `@prisma/adapter-neon`, `dotenv`, `tsx`, `argon2`, `libphonenumber-js`
- [x] Root `prisma.config.ts` with `DIRECT_URL` for CLI/migrations
- [x] Lazy Prisma singleton (`src/lib/db`) using pooled `DATABASE_URL`
- [x] Validation/normalization (`src/lib/validation`) + unit tests
- [x] Origin/honeypot helpers (`src/lib/security`)
- [x] `POST /api/registrations` — active event server-side, unique→409, Cache-Control no-store
- [x] Email: commit with `PENDING`, then `sendConfirmationEmail` → `SENT`/`FAILED` (registration kept)
- [x] Migration applied to non-prod Neon (`20260717054700_init_mvp`, `20260717062000_registration_questionnaire`)
- [x] Seed active event `toon-expo-2026` (`pnpm db:seed`)
- [x] Admin seed from `ADMIN_EMAIL` + `ADMIN_PASSWORD` (Argon2id; skips with warn if unset)
- [x] Questionnaire data model: `Registration.formVersion` + `answers` Json (nullable for legacy rows)
- [x] Typed definition + Zod branch validation (`src/lib/questionnaire`, form version `2026-vis-reg-v1`)
- [x] Registration API accepts/persists `formVersion` + `answers`; hy/en/ru labels in questionnaire i18n
- [x] Admin list/CSV select includes `formVersion` and `answers`
- [ ] Multi-step questionnaire wizard UI (separate delivery)

### Scripts

| Script | Purpose |
|---|---|
| `pnpm prisma:generate` | Generate client to `src/generated/prisma` |
| `pnpm db:migrate` | `prisma migrate dev` (local/non-prod) |
| `pnpm db:migrate:deploy` | `prisma migrate deploy` (non-prod apply) |
| `pnpm db:seed` | Seed active event + optional local admin |

### Privacy policy version constant

Clients must send `privacyPolicyVersion: "2026-07-16"` (single source: `src/lib/privacy.ts`).

## Phase 5 — Admin panel (complete)

- [x] Auth.js v5 credentials provider; Argon2id verify against `Admin` row
- [x] Secure HTTP-only JWT session cookie; middleware protects `/admin/**` except login
- [x] Login: generic errors, in-memory attempt throttle (5 failures → 60s lock; **single-instance only**)
- [x] Dashboard: total count, search (name/email/phone), pagination (25, newest first), confirmed hard delete
- [x] CSV export at `GET /api/admin/registrations/export` with formula neutralization
- [x] `Cache-Control: private, no-store` on admin pages/export
- [x] Admin UI language: **English for now** (owner language choice still pending)
- [x] Unit tests: CSV neutralization, auth path guard, login throttle

### Local admin sign-in

1. Set `AUTH_SECRET`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` (≥12 chars) in `.env` (see `.env.example`).
2. Run `pnpm db:seed` to upsert the admin (and active event).
3. Open `/admin/login` and sign in with those credentials.
4. Use **Log out** on the dashboard to end the session.

### Throttle limitation

Login throttling is process-local memory. It resets on deploy/restart and does not sync across multiple Vercel instances. Prefer WAF/edge limits before production multi-instance traffic.

## Phase 4 — Email confirmation (done)

- [x] Localized confirmation messages (`src/lib/email/confirmation-messages.ts`) for `hy`, `en`, `ru`
- [x] Plain text + simple HTML multipart via existing Resend fetch sender
- [x] Event date/venue use explicit TBA wording (no invented venue)
- [x] Commit-first delivery; placeholder Resend key skips send safely
- [x] Redacted logging preserved; unit tests for all locales

## Mid-dev security hardening (code 🤖)

- [x] Security headers + pragmatic CSP in `next.config.ts` (`docs/SECURITY_CHECKLIST_STATUS.md`)
- [x] Production Origin/Referer required for registration; Cache-Control no-store on API/admin
- [x] Request-id on registration, admin export, and admin mutating action logs
- [x] Informational `pnpm audit --prod` CI step (`continue-on-error`)
- [x] Auth.js secure cookie options + session `updateAge`; CSRF paths verified (Server Actions + Auth.js)

## Next authorized decision

Verification/load testing and production Resend domain setup. Production migrate/deploy remains owner-only. Owner security actions listed in `docs/SECURITY_CHECKLIST_STATUS.md`.
