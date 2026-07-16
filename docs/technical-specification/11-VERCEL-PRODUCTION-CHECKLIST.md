# Manual production checklist

This file contains only actions that an owner/operator must perform in external dashboards or during the controlled production release. Application code does not complete these steps automatically.

## Before connecting Vercel

- [ ] Confirm the production domain.
- [ ] Confirm event date, venue/address and event time zone.
- [ ] Confirm privacy policy, controller contact and retention/deletion policy.
- [ ] Create the Neon production project/branch in a region close to the selected Vercel function region.
- [ ] Create separate Neon migration and least-privilege runtime roles.
- [ ] Create the Neon project with PostgreSQL 18.
- [ ] Copy the pooled TLS runtime URL for `DATABASE_URL`; keep the direct/migration URL separate.
- [ ] Enable/confirm Neon backups or PITR for the selected plan and test restore to a non-production branch.
- [ ] Verify the sending domain in Resend and configure required DNS records (SPF/DKIM and any provider-required records).

## Vercel project settings

1. Import the Git repository into Vercel.
2. Confirm framework preset **Next.js**, package manager **pnpm**, and the production branch.
3. Select a function region close to the Neon database and primary audience; do not separate app and database regions without a measured reason.
4. Protect Preview deployments from unintended public access when the plan/settings allow it.
5. Do not enable automatic production migrations from an unreviewed build command.

## Production environment variables

In **Project → Settings → Environment Variables**, add production values only to the Production scope:

- [ ] `DATABASE_URL` — Neon pooled TLS runtime URL.
- [ ] `AUTH_SECRET` — a new high-entropy production secret.
- [ ] `SITE_URL` — final HTTPS origin.
- [ ] `RESEND_API_KEY` — production Resend key with minimum required access.
- [ ] `EMAIL_FROM` — verified Toon Expo sender address.
- [ ] Any additional variable present in the implemented `.env.example`.

Then:

- [ ] Use separate non-production values for Preview.
- [ ] Keep `DIRECT_URL` only in the controlled migration environment; do not add it to Vercel runtime variables.
- [ ] Confirm no variable containing a secret begins with `NEXT_PUBLIC_`.
- [ ] Redeploy after environment changes.
- [ ] Never keep the initial administrator plaintext password as a long-lived Vercel variable.

## Administrator activation

- [ ] Generate a strong unique password through an approved secure process.
- [ ] Run the controlled administrator seed/rotation command using the documented migration/operator path.
- [ ] Deliver the password to the administrator through a secure channel.
- [ ] Confirm only one administrator is active.
- [ ] Sign in, sign out and confirm an old/invalid session cannot access `/admin` or CSV export.

## Vercel WAF rate limit

In **Project → Firewall → Configure → New Rule**:

1. Name the rule `registration-rate-limit`.
2. Match the exact registration route, expected to be `/api/registrations`.
3. If the dashboard supports method matching for the selected plan, also require `POST`.
4. Start in **Log** mode during an authorized Preview/load test or a short monitored production window.
5. Review legitimate and automated traffic in Firewall observations.
6. Initial enforcement baseline: fixed window, **20 requests per 60 seconds per IP**, response/action **429 Rate Limit**.
7. Publish the rule.
8. Test that normal registration works and an intentional controlled excess receives `429` without creating registrations.
9. Record any threshold change and its evidence. Increase the threshold for shared-network false positives; reduce it only when legitimate users remain safe.

Do not use Vercel Runtime Cache as the security counter and do not add Redis for this baseline.

## Domain and transport

- [ ] Add the custom domain in **Project → Settings → Domains**.
- [ ] Configure DNS exactly as Vercel specifies.
- [ ] Choose and verify the canonical `www`/apex redirect.
- [ ] Confirm HTTPS certificate is active before publishing links.
- [ ] Verify HTTP redirects to HTTPS.
- [ ] Verify HSTS and application security headers after deployment.
- [ ] Confirm Auth.js and canonical/alternate URLs use the final HTTPS domain.

## Production database release

- [ ] Review the exact migration and backup/restore readiness.
- [ ] Apply the migration using the migration role, not the runtime role.
- [ ] Confirm the runtime role can perform required CRUD but cannot drop/alter schema.
- [ ] Seed/activate the event with confirmed production content.
- [ ] Confirm the database enforces one normalized email per event.

## Monitoring and alerts

In Vercel/Neon/Resend dashboards:

- [ ] Enable alerts available on the selected plan for function 5xx/error spikes and abnormal latency.
- [ ] Watch WAF matches/rate-limited traffic after campaign launch.
- [ ] Watch Neon connections, query failures and storage/backups.
- [ ] Watch Resend bounces/failures and verify confirmation delivery to test addresses.
- [ ] Confirm application logs redact participant PII and secrets.
- [ ] Set platform spend/usage notifications where available.

## Final smoke test

- [ ] Open Armenian, English and Russian production URLs.
- [ ] Submit one unique test registration in each locale.
- [ ] Confirm each appears once in admin and receives the correct localized email.
- [ ] Test duplicate email behavior.
- [ ] Test admin pagination/search, deletion policy and CSV safety.
- [ ] Confirm no database request is made solely to render the public form.
- [ ] Confirm admin and API responses containing participant data are not publicly cached.
- [ ] Remove approved test records according to the deletion policy.
- [ ] Record the last known-good Vercel deployment for rollback.

## After launch

- [ ] Monitor closely during the first campaign/registration peak.
- [ ] If failures rise, stop promotional traffic if possible, inspect Vercel/Neon/Resend, and rollback application deployment when appropriate.
- [ ] Never roll back a production database blindly; use the reviewed migration recovery plan.
- [ ] Rotate any secret immediately if exposure is suspected.
