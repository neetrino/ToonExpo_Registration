# Toon Expo Registration — architecture

**Project size:** A

**Architecture:** Small full-stack modular monolith

**Updated:** 2026-07-17

## Purpose

The system publishes a multilingual Toon Expo landing page, accepts attendee registrations, sends a confirmation email and gives one administrator a protected view of registration data.

## System context

```text
Visitor browser
    │
    ├── GET /{locale} ──> Vercel CDN ──> statically rendered Next.js page
    │
    └── POST registration ──> Vercel WAF ──> Next.js Route Handler
                                                │
                                                ├──> Neon PostgreSQL
                                                └──> Resend

Administrator browser
    └── /admin ──> Auth.js session ──> Next.js server layer ──> Neon PostgreSQL
```

## Architectural decisions

- One Next.js deployment contains public pages, admin pages, route handlers and server-only services.
- Public locale pages are static and CDN-cacheable.
- Registration and administrator routes are dynamic and must not be publicly cached.
- PostgreSQL is the source of truth for events, registrations, administrator credentials and email-delivery state.
- Redis is not used. Vercel WAF provides edge rate limiting; database constraints provide durable duplicate protection.
- A registration is committed before email delivery is attempted. An email-provider failure must not remove or roll back a valid registration.
- The application is designed for short bursts significantly above the expected 100 registrations per day.

## Proposed repository layout

```text
src/
├── app/
│   ├── [locale]/
│   │   ├── page.tsx
│   │   ├── privacy/page.tsx
│   │   └── success/page.tsx
│   ├── admin/
│   │   ├── login/page.tsx
│   │   └── page.tsx
│   ├── api/
│   │   ├── registrations/route.ts
│   │   └── admin/registrations/export/route.ts
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── landing/
│   ├── registration/
│   ├── admin/
│   └── ui/
├── lib/
│   ├── auth/
│   ├── db/
│   ├── email/
│   ├── i18n/
│   ├── questionnaire/
│   ├── registrations/
│   ├── security/
│   └── validation/
└── types/

messages/
├── hy.json
├── en.json
└── ru.json

prisma/
├── schema.prisma
├── migrations/
└── seed.ts
```

The exact route grouping may be refined during implementation without changing the boundaries above.

## Request flows

### Public page

1. The visitor requests a locale URL.
2. Vercel CDN serves cached HTML and static assets.
3. No database request is performed merely to display the form.

### Registration

1. Vercel WAF evaluates the registration endpoint limit.
2. The server validates origin, honeypot, payload shape, consent, `formVersion`, and questionnaire `answers`.
3. Values are trimmed and normalized; email is lowercased and phone is normalized. Answers are validated against the typed branch definition for the active form version.
4. PostgreSQL creates the registration under the per-event email uniqueness constraint, storing identity columns plus `formVersion` and structured `answers` JSON.
5. Duplicate constraint errors return the same safe user-facing outcome regardless of concurrent requests.
6. After commit, the system attempts to send a localized confirmation email through Resend.
7. Delivery state is persisted without logging the full email address or phone number.
8. The client receives a localized success or safe error response with a request identifier.

### Administrator

1. The administrator signs in through Auth.js.
2. Server-side authorization protects every admin page and export endpoint.
3. The dashboard queries aggregate count and a paginated registration list.
4. Search uses indexed/normalized fields and bounded input.
5. Delete requires confirmation and records the deletion time or performs the approved deletion policy defined during implementation.

## Data boundaries

- Client components never import Prisma, secrets, Auth.js server configuration or Resend clients.
- All mutations are validated again on the server even when client validation succeeds.
- Public translations and event presentation content may be bundled at build time.
- Participant data is never placed in a shared cache or static payload.

## Reliability and scale

- Use Neon pooled connection string for Vercel runtime traffic.
- Initialize database and external-service clients lazily and reuse them within warm functions.
- Keep the registration transaction short; do not call Resend inside the database transaction.
- Use a unique database constraint rather than a check-then-insert race.
- Paginate admin results and select only required columns.
- Apply timeouts to Resend and database operations where supported.
- Run a non-production burst test before release and observe errors, latency and database connections.

## Security

- HTTPS, HSTS and baseline security headers.
- WAF rate limiting on registration and conservative login throttling.
- Secure session cookies and server-side authorization.
- Argon2id password hash for the administrator.
- Separate runtime and migration database roles.
- Secrets stored only in Vercel environment variables.
- Logs contain request IDs and safe operational fields, not raw PII.

## Questionnaire storage

Visitor questionnaire answers are stored on `Registration` as:

- `formVersion` — string constant for the active definition (e.g. `2026-vis-reg-v1`)
- `answers` — structured JSON validated server-side against `src/lib/questionnaire`

There is no CMS-style `FormVersion` / `Question` / `RegistrationAnswer` table set. Branching follows `answers.visitPurpose` (`own_residence` | `investment` | `market_research`). Labels for `hy` / `en` / `ru` live in `src/lib/questionnaire/i18n.ts`.

## Deployment boundary

The repository may contain deployment configuration and documentation, but production deployment, DNS changes, production secrets, WAF publication and production migrations are performed manually by the owner according to the production checklist.
