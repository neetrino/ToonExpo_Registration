# Toon Expo Registration — brief

**Status:** approved for documentation

**Updated:** 2026-07-16

## Product

Toon Expo Registration is a multilingual event landing page whose primary action is attendee registration. The system also includes a protected panel for one administrator to monitor registrations and export participant data.

The first release is intentionally small, but its data model must allow future events and additional questionnaire fields without replacing the registration flow.

## Audience

- Visitors interested in Toon Expo who register from desktop or mobile devices.
- One event administrator who reviews registration volume and participant details.

## MVP priorities

1. Multilingual landing page and registration form — high.
2. Reliable registration persistence and duplicate protection — high.
3. Registration confirmation email — high.
4. Protected admin dashboard with count, search, pagination, deletion and CSV export — high.
5. Future questionnaire support — later release, architecture only in MVP.

## Registration fields

- First name.
- Last name.
- Email.
- Phone number.
- Consent to personal-data processing and privacy policy.

## Languages

- Armenian (`hy`) — default public locale.
- English (`en`).
- Russian (`ru`).

## Confirmed constraints

- Project size: A (small).
- No attendee accounts.
- No capacity limit or waiting list.
- No registration status workflow.
- The administrator cannot edit participant data in MVP.
- One email may register only once for one event.
- The same phone number may be used by more than one participant.
- Expected organic volume is at least 100 registrations per day, with possible short traffic bursts.
- Redis is not used in MVP.
- Public pages use Next.js static rendering and Vercel CDN caching.
- Registration writes are never cached.
- Vercel WAF protects the registration endpoint with rate limiting.

## Design reference

- Previous stage: <https://toonexpo.neetrino.app/>
- Reuse the existing Toon Expo brand assets when source files are supplied or approved for reuse.
- Observed reference palette: deep teal `#00303D`, secondary teal `#246976`, accent teal `#2BA8B0`, yellow accent `#FFD700`.
- The previous site is a visual and brand reference, not a functional specification for the registration product.

## Integrations

- Neon PostgreSQL.
- Resend for confirmation emails.
- Auth.js for the single administrator session.
- Vercel hosting, CDN, WAF and platform observability.

## Pending content inputs

- Exact November event date and schedule.
- Confirmed venue name and address (the venue may be Meridian; this is not yet confirmed).
- Final Armenian, English and Russian copy.
- Approved logo, hero artwork, social links and legal/privacy text.
- Production domain and sender email domain.

These content inputs do not block application architecture, but they block final content acceptance and production release.
