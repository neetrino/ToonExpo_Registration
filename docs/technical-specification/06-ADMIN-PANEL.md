# Admin panel

## Purpose

Extend the existing single-admin interface only where operations require it. Do not turn it into a general integration platform.

## Existing capabilities retained

- Auth.js login/logout.
- Registration count, list, search and details.
- CSV export with formula-injection protection.
- Existing deletion action, subject to the ticket lifecycle review below.

## Registration list/detail additions

Show:

- source `TOON_EXPO`/`MOOTQ`;
- ticket code in a copy-safe/read-only form;
- email delivery status;
- SMS delivery status;
- attendance `NOT_VISITED`/`VISITED`;
- source registration ID for diagnostics;
- created/updated time.

Never display the hosted-ticket token, partner credentials, provider keys or raw provider responses.

Source filters, counts and exports use the stored `sourceSystem`. The admin never infers origin from `ticketCode`.

## Delivery operations

Show:

- pending/processing/failed counts by channel;
- oldest pending job age;
- safe last error category;
- last attempt time.

Allow a bounded manual resend only after implementation defines how intentional resend changes the logical-send version. Do not provide unrestricted bulk resend.

## Full synchronization

Add:

- button `Import full data from Mootq`;
- confirmation before starting;
- running/progress state;
- result counts;
- history of import/export runs;
- safe bounded error summary.

There is no pre-event/live polling switch. Mootq owns its polling schedule.

## Ticket actions

- Regenerate QR image from immutable `ticketCode`.
- Download QR PNG.
- Open the hosted-ticket page through a controlled admin action.
- Do not offer code regeneration after issue.

## Deletion/lifecycle review

The existing hard-delete behavior must be reviewed before ticket launch:

- silently deleting a synchronized Toon Expo-origin ticket may leave it valid in Mootq;
- if cancellation/revocation is required, define it as an explicit later requirement and feed event;
- until then, admin must receive a clear warning for synchronized records.

This specification does not invent a cancellation workflow that the owner has not requested.

## CSV export

Exports may include approved registration/questionnaire/source/ticket/attendance fields. Exclude ticket-view tokens, provider secrets, auth fields, delivery locks and raw sync errors.
