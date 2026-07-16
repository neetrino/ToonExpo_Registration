# Toon Expo Registration — AI project entry point

## Project

Toon Expo Registration is a multilingual event landing page focused on attendee registration. Visitors submit first name, last name, email, phone and privacy consent. One administrator can sign in, review the registration count and participant list, search, paginate, delete an erroneous registration and export CSV.

Public languages: Armenian (`hy`, default), English (`en`) and Russian (`ru`).

## Current status

- Product scope, stack and architecture are approved.
- Technical documentation is complete.
- Application implementation has not started.
- Production deployment and production migrations are not authorized automatically.

## Confirmed technical direction

- Project size A: small full-stack Next.js modular monolith.
- Next.js 16, React 19, TypeScript, Tailwind CSS and shadcn/ui.
- Neon PostgreSQL 18 with Prisma.
- Auth.js for one administrator.
- Resend for localized confirmation email.
- Vercel for hosting, CDN and WAF rate limiting.
- No Redis, NestJS, separate backend, payments, attendee accounts or questionnaire in MVP.
- Public landing pages are static/CDN-cacheable; registration writes and admin data are never publicly cached.

## Read in this order

1. [`AGENTS.md`](./AGENTS.md) — repository rules.
2. [`docs/BRIEF.md`](./docs/BRIEF.md) — product brief.
3. [`docs/TECH_CARD.md`](./docs/TECH_CARD.md) — approved stack and boundaries.
4. [`docs/01-ARCHITECTURE.md`](./docs/01-ARCHITECTURE.md) — system architecture and data flows.
5. [`docs/technical-specification/00-INDEX.md`](./docs/technical-specification/00-INDEX.md) — complete specification map.
6. [`docs/PROGRESS.md`](./docs/PROGRESS.md) — current delivery status.

Use the linked detailed specification files as the source of truth for implementation and acceptance criteria. Do not infer missing event content.

## Pending owner inputs

- Exact November event date and schedule.
- Confirmed venue name and address.
- Final Armenian, English and Russian content.
- Approved source logo/artwork and legal/privacy text.
- Production domain and verified Resend sender.
- Hard-delete versus audited soft-delete policy.
- Administrator interface language.

These inputs do not block project foundation and core architecture, but they block final content acceptance or production release where applicable.
