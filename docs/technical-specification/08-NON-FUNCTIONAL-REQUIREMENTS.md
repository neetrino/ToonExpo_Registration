# Non-functional requirements

## Expected load

- Organic demand: 100 or more registrations per day.
- Architecture target: remain stable during short promotional bursts well above average daily traffic.
- Project size remains A because functional/domain complexity is small.

## Performance

| ID | Requirement |
|---|---|
| PERF-01 | Public landing HTML and static assets MUST be CDN-cacheable. |
| PERF-02 | Rendering the public registration form MUST perform zero database queries. |
| PERF-03 | Registration mutation MUST perform bounded database work and no unbounded list queries. |
| PERF-04 | Resend network work MUST occur outside the database transaction. |
| PERF-05 | Admin lists MUST be paginated and select only required fields. |
| PERF-06 | Application runtime MUST use a Neon pooled TLS connection. |
| PERF-07 | Public images MUST be appropriately sized, compressed and lazy-loaded below the fold. |

User-facing numeric latency targets must be established from a deployed Preview baseline rather than guessed. Before production, the team must record p50/p95 registration latency under the agreed load test and confirm no connection exhaustion or error spike.

## Load verification scenario

Run only against Preview/staging with test data and explicit provider limits:

1. Warm the public page and confirm CDN behavior.
2. Submit a realistic burst of unique registrations.
3. Mix valid, invalid and duplicate requests.
4. Confirm exactly one record per event/email.
5. Observe Vercel function errors/duration and Neon connection/query metrics.
6. Confirm the WAF/load-test plan does not accidentally block the authorized test; never disable production protection casually.
7. Remove or isolate test registrations through a controlled non-production reset.

The concrete concurrency and duration are selected after the Vercel and Neon plans are known. At minimum, test materially above the expected organic peak.

## Reliability

- Registration persistence takes precedence over confirmation-email delivery.
- External calls use bounded timeouts and safe error mapping.
- Non-idempotent work is not blindly retried.
- Database uniqueness guarantees correctness during races.
- Safe client messaging distinguishes validation, duplicate, rate-limit and temporary failures.
- Deployment rollback and database migration rollback/forward-fix strategy are documented before production.

## Accessibility

- Target WCAG 2.2 AA for the registration journey and admin essentials.
- Keyboard-accessible navigation, form, locale switcher, dialogs and table actions.
- Visible focus states.
- Correct labels, descriptions and error associations.
- Color contrast must remain sufficient across the Toon Expo palette.
- Success/errors must not rely only on color.
- Respect reduced-motion preference.

## Responsive support

- Current stable versions of Chrome, Safari, Firefox and Edge.
- iOS Safari and Android Chrome on representative current devices.
- Functional layout from 320 CSS pixels upward.
- Touch targets and on-screen keyboard behavior must be verified for the form.

## Localization quality

- No hardcoded public UI text outside locale catalogs.
- Armenian, English and Russian layouts must tolerate text-length differences.
- Dates/times use locale-aware formatting with an explicitly selected event time zone.
- Telephone input does not assume only Armenian participants.
- Missing translations fail validation/build or visibly fall back according to a documented rule.

## SEO and sharing

- Localized title and description.
- Canonical and alternate-language links.
- Open Graph image/content supplied from approved assets.
- Sitemap and robots configuration.
- Admin routes excluded from indexing.

## Observability

- Structured production logs with request IDs and PII redaction.
- Vercel monitoring for function error rate and latency.
- Neon monitoring for connections and query failures.
- Resend delivery visibility for confirmation failures.
- Owner-configured production alerts before campaign traffic begins.

## Maintainability

- Strict TypeScript.
- Clear server/client boundaries.
- Shared validation schemas where they do not leak server code to the client.
- No abstraction layers without a real boundary.
- Automated format, lint, typecheck, test and build gates.
