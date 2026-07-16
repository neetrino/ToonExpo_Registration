# Functional requirements

## Public experience

| ID | Requirement |
|---|---|
| PUB-01 | The system MUST expose Armenian, English and Russian public routes. |
| PUB-02 | Armenian MUST be the default public locale unless the owner approves another default before implementation. |
| PUB-03 | A locale switch MUST preserve the equivalent page/section when possible. |
| PUB-04 | The landing page MUST render event name, date, venue and approved descriptive content. |
| PUB-05 | The primary call to action MUST bring the visitor to the registration form. |
| PUB-06 | The registration form MUST work at supported mobile, tablet and desktop widths. |
| PUB-07 | The site MUST expose a localized privacy page or approved external privacy-policy URL. |
| PUB-08 | The page MUST provide localized metadata, canonical URLs and Open Graph data. |

## Registration form

| ID | Requirement |
|---|---|
| REG-01 | The form MUST collect first name, last name, email, phone and privacy consent. |
| REG-02 | Every field MUST have an accessible label; placeholder text MUST NOT be the only label. |
| REG-03 | Client validation SHOULD provide immediate localized feedback. |
| REG-04 | Server validation MUST be authoritative. |
| REG-05 | The submit button MUST show a pending state and prevent accidental repeated clicks. |
| REG-06 | A hidden honeypot field MUST reject obvious automated submissions without revealing the rule. |
| REG-07 | A successful registration MUST display a localized confirmation state. |
| REG-08 | A duplicate email for the active event MUST NOT create a second row. |
| REG-09 | Duplicate handling MUST be safe under simultaneous requests. |
| REG-10 | The same phone number MAY be used by different registrations. |
| REG-11 | The registration MUST store the locale used at submission. |
| REG-12 | The system MUST record the privacy-policy version and consent time. |
| REG-13 | Validation and temporary service errors MUST preserve non-sensitive form input where safe. |

## Confirmation email

| ID | Requirement |
|---|---|
| MAIL-01 | After a registration is committed, the system MUST attempt to send a confirmation email through Resend. |
| MAIL-02 | Email content MUST use the registration locale. |
| MAIL-03 | Email-provider failure MUST NOT roll back or delete the registration. |
| MAIL-04 | The system MUST store email delivery state and last attempt time. |
| MAIL-05 | Email content MUST include only approved event details and an organizer contact or support route. |
| MAIL-06 | The system MUST use a verified production sender domain before launch. |

## Administrator authentication

| ID | Requirement |
|---|---|
| AUTH-01 | Anonymous users MUST NOT access administrator pages, data endpoints or exports. |
| AUTH-02 | The system MUST support exactly one active administrator in MVP. |
| AUTH-03 | Invalid login attempts MUST return a generic error. |
| AUTH-04 | Administrator passwords MUST be stored only as Argon2id hashes. |
| AUTH-05 | A successful login MUST create a secure server-validated session. |
| AUTH-06 | Logout MUST invalidate the active session. |

## Admin dashboard

| ID | Requirement |
|---|---|
| ADM-01 | The dashboard MUST display the total number of registrations for the selected/active event. |
| ADM-02 | The dashboard MUST display registrations using server-side pagination. |
| ADM-03 | The list MUST show name, email, phone, locale and registration time. |
| ADM-04 | Search MUST match bounded queries against name, email and normalized phone. |
| ADM-05 | Default ordering MUST be newest registration first with a stable tie-breaker. |
| ADM-06 | The administrator MUST be able to delete one registration after explicit confirmation. |
| ADM-07 | Participant editing MUST NOT be available in MVP. |
| ADM-08 | CSV export MUST reflect the active event and approved filters. |
| ADM-09 | CSV output MUST neutralize cells that could be interpreted as spreadsheet formulas. |
| ADM-10 | Empty, loading and failure states MUST be explicit. |

## Operational behavior

| ID | Requirement |
|---|---|
| OPS-01 | Public static page requests MUST NOT query PostgreSQL merely to render the registration form. |
| OPS-02 | Registration POST responses MUST NOT be publicly cached. |
| OPS-03 | Administrator pages and responses containing participant data MUST use private/no-store behavior. |
| OPS-04 | Each server request SHOULD have a correlation/request ID in logs. |
| OPS-05 | Production logs MUST NOT contain full participant email, phone, auth tokens or password data. |
