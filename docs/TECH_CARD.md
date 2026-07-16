# Toon Expo Registration — technology card

**Project:** Toon Expo Registration

**Size:** A

**Date:** 2026-07-16

**Status:** approved for implementation planning

## 1. Foundation

| Parameter | Decision | Status |
|---|---|---|
| Architecture | Small full-stack Next.js modular monolith | Approved |
| Layout | `src/app`, `src/components`, `src/lib`, `src/types` | Approved |
| Package manager | pnpm | Approved |
| Runtime | Node.js 24.x LTS | Approved |
| Language | TypeScript 5.9, strict mode | Approved |
| Git workflow | Feature branches, Conventional Commits | Approved |

## 2. Frontend

| Parameter | Decision | Status |
|---|---|---|
| Framework | Next.js 16 App Router, React 19 | Approved |
| Styling | Tailwind CSS 4 | Approved |
| Components | shadcn/ui primitives plus custom Toon Expo theme | Approved |
| Forms | React Hook Form and Zod | Approved |
| Data fetching | Server Components by default | Approved |
| Localization | `next-intl`; `hy`, `en`, `ru`; path-based locale | Approved |
| SEO | Metadata API, sitemap, robots, Open Graph | Approved |
| Theme | Brand theme only; no dark-mode switch | Approved |
| Motion | Restrained CSS transitions; no required animation library | Approved |
| PWA | Not required | Not applicable |

## 3. Backend

| Parameter | Decision | Status |
|---|---|---|
| Backend | Next.js Route Handlers and server-only services | Approved |
| API style | Internal REST endpoints | Approved |
| Validation | Shared Zod schemas plus database constraints | Approved |
| Rate limiting | Vercel WAF on registration endpoint | Approved |
| API documentation | Technical specification; no Swagger | Approved |
| File uploads | Not required | Not applicable |
| Redis/cache service | Not used in MVP | Not applicable |

## 4. Data

| Parameter | Decision | Status |
|---|---|---|
| Database | PostgreSQL 17 on Neon | Approved |
| ORM | Prisma 7 | Approved |
| Connection mode | Neon pooled TLS connection for application runtime | Approved |
| Core entities | Event, Registration, Admin | Approved |
| Duplicate rule | Unique normalized email per event | Approved |
| Pagination | Server-side cursor or stable offset pagination | Approved |
| Application DB role | Least-privilege runtime role separate from migration role | Approved |
| Backups | Neon automated backup/PITR according to selected plan | Required before production |

Adaptive database timeouts and connection limits must be selected during implementation from the actual Neon plan and validated under load; they must not be guessed in documentation.

## 5. Authentication

| Parameter | Decision | Status |
|---|---|---|
| Solution | Auth.js | Approved |
| Provider | Credentials for one seeded administrator | Approved |
| Password storage | Argon2id hash; never plaintext | Approved |
| Sessions | Secure, HTTP-only, SameSite cookies | Approved |
| Roles | One `ADMIN` role | Approved |
| Password reset | Not exposed in MVP; controlled manual rotation | Approved |

## 6. External services

| Parameter | Decision | Status |
|---|---|---|
| Email | Resend | Approved |
| Payments | Not required | Not applicable |
| Analytics | Vercel Web Analytics only if approved before release | Optional |
| Error monitoring | Vercel logs/alerts baseline; Sentry may be added later | Approved |
| Storage | Local public assets or approved remote brand assets; no new object store required | Approved |

## 7. Hosting and operations

| Parameter | Decision | Status |
|---|---|---|
| Application hosting | Vercel | Approved |
| Environments | Local, Preview, Production | Approved |
| CI | GitHub Actions | Approved |
| Domain | Custom production domain, pending value | Pending input |
| WAF | Rate-limit only the registration mutation route | Required before production |
| CDN | Vercel CDN for static public pages and assets | Approved |
| Logs | Structured and redacted; no full PII | Approved |
| Deployment | Production deployment remains a manual owner action | Approved |

## 8. Testing and quality

| Parameter | Decision | Status |
|---|---|---|
| Unit/integration | Vitest | Approved |
| Component tests | React Testing Library for form behavior where valuable | Approved |
| E2E | Playwright for registration, duplicate handling and admin access | Approved |
| Load test | Registration endpoint burst test in a non-production environment | Required |
| Quality gates | Format, lint, typecheck, tests, build | Required |

## 9. Security baseline

- Server-side input validation and normalization.
- Parameterized ORM queries.
- Database unique constraint for duplicate prevention.
- CSRF-safe mutation flow and strict origin checks where applicable.
- Secure administrator cookies, login throttling and generic auth errors.
- Vercel WAF rate limiting for public registration.
- Honeypot field for low-cost bot filtering.
- Security headers and HTTPS.
- Secrets only in environment variables.
- No secrets, passwords, tokens or complete participant data in logs.
- CSV export protected against spreadsheet-formula injection.
- Data deletion requires an explicit confirmation step.

## 10. Explicit exclusions

- NestJS, Docker, Kubernetes, Redis and queues.
- Attendee login or attendee profile.
- Payments, tickets, QR codes and check-in.
- Capacity limits, waiting lists and registration statuses.
- Participant editing.
- Survey/questionnaire UI in MVP.
- Production deployment or production migration as part of documentation work.

## 11. Related documents

- [`BRIEF.md`](./BRIEF.md)
- [`01-ARCHITECTURE.md`](./01-ARCHITECTURE.md)
- [`technical-specification/00-INDEX.md`](./technical-specification/00-INDEX.md)
- [`technical-specification/11-VERCEL-PRODUCTION-CHECKLIST.md`](./technical-specification/11-VERCEL-PRODUCTION-CHECKLIST.md)

## 12. Approval record

The product owner approved project size A, the proposed full-stack Next.js stack, three public languages, email confirmation, the one-admin model, no capacity limit/status workflow, no Redis in MVP, and creation of this documentation set in the conversation preceding this document.
