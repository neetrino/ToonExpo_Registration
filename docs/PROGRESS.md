# Toon Expo Registration — progress

**Updated:** 2026-07-17

| Phase | Status | Notes |
|---|---|---|
| Product intake and scope | Complete | Core MVP, size A, languages and stack approved |
| Technical specification | Complete | See `docs/technical-specification/` |
| Final event content/assets | Pending | Date, venue, final translations, legal text and source assets required |
| Application foundation | Complete (Phase 1) | Next.js scaffold, locale routes, tokens, i18n, env schema, CI baseline |
| Database and registration | Phase 2 core done | Prisma 7 + Neon; migrate applied on non-prod Neon; `POST /api/registrations` |
| Landing and localization | Phase 3 UI done | Branded landing + form; final copy/assets still pending |
| Email confirmation | Partial stub | Commit-first + Resend attempt; placeholder key → FAILED safely |
| Admin dashboard | Not started | One administrator |
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
- [x] Migration applied to non-prod Neon (`20260717054700_init_mvp` via `pnpm db:migrate:deploy`)
- [x] Seed active event `toon-expo-2026` (`pnpm db:seed`; admin still stubbed)
- [ ] Real Resend templates / Auth.js (out of this core pass)

### Scripts

| Script | Purpose |
|---|---|
| `pnpm prisma:generate` | Generate client to `src/generated/prisma` |
| `pnpm db:migrate` | `prisma migrate dev` (local/non-prod) |
| `pnpm db:migrate:deploy` | `prisma migrate deploy` (non-prod apply) |
| `pnpm db:seed` | Seed active `toon-expo-2026` event (wired in `prisma.config.ts`) |

### Privacy policy version constant

Clients must send `privacyPolicyVersion: "2026-07-16"` (single source: `src/lib/privacy.ts`).

## Next authorized decision

Continue Auth.js admin + Resend localized templates. Production migrate/deploy remains owner-only.
