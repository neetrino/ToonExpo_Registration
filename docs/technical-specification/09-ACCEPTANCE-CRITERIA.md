# MVP acceptance criteria

## Content readiness

- [ ] Exact event date, venue and address are approved in all three languages.
- [ ] Approved logo, artwork and legal/privacy content are supplied.
- [ ] No development placeholder remains in production-facing content.

## Public site

- [ ] Armenian, English and Russian routes render and switch correctly.
- [ ] Landing design is responsive and consistent with approved Toon Expo branding.
- [ ] Form and primary call to action are obvious on mobile and desktop.
- [ ] Metadata, canonical/alternate URLs, sitemap, robots and social preview are correct.
- [ ] Admin pages are not indexable.

## Registration

- [ ] A valid submission creates exactly one registration linked to the active event.
- [ ] Required fields, invalid email/phone and missing consent are rejected client- and server-side.
- [ ] Armenian, Latin and Cyrillic names are accepted within safe bounds.
- [ ] Repeated click and concurrent duplicate tests create no duplicate rows.
- [ ] Duplicate email for the same event produces a safe localized outcome.
- [ ] Same phone may appear on multiple valid registrations.
- [ ] Honeypot submissions are rejected.
- [ ] A Resend failure does not remove the registration and is operationally visible.
- [ ] Registration responses are not publicly cached.

## Admin

- [ ] Anonymous access to dashboard, mutations and CSV is denied.
- [ ] The single administrator can sign in and out.
- [ ] Total count matches active registrations in the database.
- [ ] Pagination, search and stable newest-first ordering work.
- [ ] Delete requires confirmation and follows the approved deletion policy.
- [ ] Participant editing is absent.
- [ ] CSV contains the approved records/columns and is formula-safe.
- [ ] Admin responses containing PII are private/no-store.

## Security and privacy

- [ ] Password is Argon2id-hashed and no production credential is committed.
- [ ] Cookies and authorization are configured securely in production.
- [ ] WAF rate limit is published and verified on the registration endpoint.
- [ ] Security headers and HTTPS are verified.
- [ ] Runtime database role has least privilege and TLS connection.
- [ ] Logs contain no full email, phone, tokens, cookies, secrets or raw form bodies.
- [ ] Privacy-policy version and consent time are stored.
- [ ] Retention/deletion policy and controller contact are published.

## Performance and reliability

- [ ] Public page is served through Vercel CDN without a database read.
- [ ] Neon pooled connection is used in runtime.
- [ ] Preview burst test completes without duplicate rows, connection exhaustion or unacceptable error rate.
- [ ] Vercel, Neon and Resend operational views are checked.
- [ ] Rollback procedure is understood before production migration/deploy.

## Engineering quality

- [ ] Formatting passes.
- [ ] ESLint passes with no ignored new errors.
- [ ] Type checking passes.
- [ ] Unit/integration tests pass.
- [ ] Critical Playwright flows pass.
- [ ] Production build passes.
- [ ] `.env.example` documents every required variable without real secrets.
- [ ] Manual production checklist is completed by the owner.
