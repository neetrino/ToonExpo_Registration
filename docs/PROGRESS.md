# Toon Expo Registration — progress

**Updated:** 2026-07-17

| Phase | Status | Notes |
|---|---|---|
| Product intake and scope | Complete | Core MVP, size A, languages and stack approved |
| Technical specification | Complete | See `docs/technical-specification/` |
| Final event content/assets | Pending | Date, venue, final translations, legal text and source assets required |
| Application foundation | Complete (Phase 1) | Next.js scaffold, locale routes, tokens, i18n, env schema, CI baseline |
| Database and registration | Not started | Safe migration workflow required |
| Landing and localization | Not started | Depends on approved content/assets |
| Email confirmation | Not started | Resend account/domain required for production |
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

## Next authorized decision

Review the specification and supply/confirm the pending inputs listed in [`technical-specification/00-INDEX.md`](./technical-specification/00-INDEX.md). Database and registration work starts after explicit authorization.
