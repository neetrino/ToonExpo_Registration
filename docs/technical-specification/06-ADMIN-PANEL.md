# Admin panel

## Purpose

Give one trusted operator an accurate, low-complexity view of Toon Expo registrations without direct database access.

## Routes

- `/admin/login` — administrator login.
- `/admin` — registration dashboard.

Public locale prefixes are not required for the admin area. The administrator interface may use one operational language selected during implementation; public content remains trilingual.

## Login

- Email and password fields.
- Generic invalid-credentials response.
- Submit pending state.
- Conservative application-level throttling independent of public registration WAF rule.
- Secure Auth.js session cookie.
- Authenticated visits to `/admin/login` redirect to the dashboard.
- Unauthenticated visits to protected routes redirect to login without leaking data.

## Dashboard layout

### Summary

- Active event name.
- Total active registrations.
- Timestamp/time zone context for displayed dates.

No charts are required for MVP; a clear total and operational table are sufficient.

### Filters

- Search input for name, email or phone.
- Clear-search action.
- Search is debounced or explicitly submitted to prevent a query per keystroke.
- Query length is bounded.

### Registration table

Columns:

- registration time;
- first and last name;
- email;
- phone;
- locale;
- email-delivery status;
- actions.

Behavior:

- newest first;
- stable server-side pagination;
- sensible page size, initially 25 or 50;
- responsive small-screen representation;
- loading, empty, no-results and error states;
- no public/shared caching.

## Deletion

- One destructive action per row/detail view.
- Confirmation dialog includes enough information to identify the record.
- Confirm button is visually and semantically destructive.
- Mutation is authorized and validated on the server.
- Successful deletion updates count and current page.
- Failure preserves the existing row and shows a safe recoverable error.
- Bulk deletion is excluded.

The final hard-delete/soft-delete policy must match [`04-DATA-MODEL.md`](./04-DATA-MODEL.md) and the approved privacy policy.

## CSV export

- Export is generated on the server after session validation.
- File name includes event slug and export date.
- Columns are allowlisted and human-readable.
- Formula-injection protection is mandatory.
- The endpoint must not include administrator credentials, internal delivery IDs or security metadata.
- Export of the expected dataset should stream or use bounded memory if dataset size later grows materially.

## Explicit exclusions

- Editing participant data.
- Multiple users/roles and permission management.
- Registration status changes.
- Manual participant creation.
- Bulk email from the dashboard.
- Dashboard content management.
