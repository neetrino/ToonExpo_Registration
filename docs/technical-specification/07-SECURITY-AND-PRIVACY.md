# Security and privacy

## Threat focus

The highest-risk surfaces are the public registration mutation, administrator login/session, CSV export, personal-data storage and production secrets.

## Public form controls

- Vercel WAF rate limit on the exact registration endpoint.
- Hidden honeypot and server-side timing/shape checks where justified.
- Strict body-size and field-length limits.
- Zod validation and normalization on the server.
- Database uniqueness constraint for concurrent duplicates.
- Same-origin/CSRF-safe mutation design.
- Generic error responses without database/provider details.
- Optional BotID/CAPTCHA only after monitoring demonstrates bot abuse not handled by baseline controls.

## Administrator controls

- One seeded administrator with unique normalized email.
- Argon2id password hashing with implementation-time parameters appropriate to the runtime.
- Strong unique password delivered through a secure channel, never chat, source control or a committed file.
- Secure, HTTP-only, SameSite session cookie; `Secure` in production.
- Bounded session lifetime and logout invalidation.
- Server-side authorization on every page, action and export endpoint.
- Login throttling and generic failures.
- Manual password rotation runbook.
- MFA is recommended as a post-MVP hardening item or by changing to an allowlisted OAuth provider if approved.

## Data minimization

Store only:

- name and surname;
- email and phone;
- selected locale;
- event relationship;
- consent evidence;
- technical email-delivery metadata;
- creation/update timestamps.

Do not store full IP addresses, user-agent history, marketing profiles or questionnaire answers without an approved purpose and updated privacy notice.

## Privacy requirements

- The form must link to the published privacy policy before consent.
- Consent cannot be pre-checked.
- Store policy version and server timestamp.
- Define data controller/contact, purpose, retention duration and deletion request process before production.
- Do not use registration email for marketing unless separate legally valid consent is introduced.
- Determine hard versus soft deletion and retention before the first production migration.
- Production exports are personal data and must be stored/shared securely outside the application.

## Secrets

- `.env*` values are ignored except `.env.example`.
- Vercel environment variables are separated for Preview and Production.
- Neon, Resend and Auth secrets are never exposed with `NEXT_PUBLIC_` prefixes.
- Preview must not use the production database or production Resend sender unless explicitly approved.
- Rotate a secret immediately if it appears in logs, Git history or a public client bundle.

## Headers and transport

- HTTPS only in production.
- HSTS after the production domain is confirmed and HTTPS is verified.
- `X-Content-Type-Options: nosniff`.
- Frame protection through CSP `frame-ancestors` and/or `X-Frame-Options`.
- A scoped Content Security Policy compatible with required Vercel/Resend-independent frontend assets.
- Restrictive `Referrer-Policy` and `Permissions-Policy`.
- No permissive wildcard CORS for authenticated or registration endpoints.

## Logs and observability

Allowed operational fields include request ID, route, status, duration, event ID and redacted/hash identifiers when necessary. Logs must not contain:

- full email or phone;
- passwords or password hashes;
- authorization headers;
- cookies/session tokens;
- database connection strings;
- Resend API keys;
- raw form bodies or CSV content.

## CSV security

- Require an active administrator session at generation time.
- Use private/no-store responses.
- Prevent spreadsheet-formula injection.
- Do not create permanent public export URLs.
- Log export occurrence without logging exported records.

## Dependency and release security

- Lock dependencies and use frozen installs in CI.
- Enable dependency alerts/updates.
- Block release on known critical vulnerabilities unless an explicit documented exception exists.
- Run migrations with a separate privileged role; runtime credentials must not have schema-drop permissions.
