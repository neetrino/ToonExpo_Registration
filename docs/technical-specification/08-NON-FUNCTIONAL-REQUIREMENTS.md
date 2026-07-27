# Non-functional requirements

## Expected scale

- 30,000 registrations across three days.
- Approximately 10,000/day.
- Rehearsal peak: 1,000 registrations in ten minutes.
- Approximately 90% Toon Expo and 10% Mootq.
- Mootq live polling may be once every three seconds.
- Full synchronization covers at most the event dataset and runs only a small number of times.

## Performance

- Public registration should normally commit and return the ticket within 1 second, excluding network variance.
- QR generation/display must not wait for email/SMS.
- Fast feed should normally answer an empty/small page within 500 ms.
- Full sync uses bounded pages, default 500 and contract-tested maximum.
- Provider dispatch must respect Resend/Peleka limits without blocking registration.

These are initial service targets, not unsupported provider guarantees.

## Reliability

- Registration/ticket and delivery jobs commit atomically.
- Identical Mootq transport retries do not duplicate data or logical sends.
- Delivery failures remain retryable/visible.
- Fast feed catches up from cursor after partner downtime.
- Full sync resumes/reruns from stored progress.
- Immutable ID conflicts are surfaced rather than overwritten.

## Availability and database

- Use Vercel Pro and a paid Neon production plan.
- Use the Neon pooled runtime connection.
- Keep Vercel and Neon in the nearest practical colocated region.
- Avoid database scale-to-zero during rehearsals/event windows if the selected Neon plan supports configuration.
- Validate backup/PITR and restoration before production.

## Provider readiness

- Resend plan/quota/rate and sender authentication confirmed.
- Peleka authentication, throughput and failure behavior confirmed.
- Maintain operational headroom for retries/resends.

## Load/failure rehearsal

Test:

- 1,000 registrations/ten minutes;
- mixed Toon Expo code creation and Mootq imports;
- shared source-IP traffic;
- provider 429/timeouts;
- delayed delivery backlog recovery;
- feed cursor replay and catch-up;
- full-sync interruption and rerun;
- code/source-ID conflicts.

## Accessibility

- QR page usable on mobile and desktop.
- Readable text code provided.
- QR has sufficient size/contrast/quiet zone.
- All ticket actions keyboard accessible.
- Localized loading/success/error states.

## Maintainability

- Keep business logic in server-only modules, not Route Handler bodies.
- Add only the three supporting tables required by delivery, feed and sync history.
- Do not add a second backend or broker without measured evidence.
