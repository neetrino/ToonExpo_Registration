# Questionnaire update — 2026-10-19

Source: [client questionnaire](https://docs.google.com/document/d/1WpB_lSmHneQkobRLxyynb2TkeO6XYn3sBSUjpJz5zu8/edit), reread on 2026-10-19. The owner relayed client approval to fully match the new questionnaire and confirmed three payment methods with an income-tax-refund follow-up only for mortgages.

## Scope

- General questionnaire: Armenian, English and Russian.
- Spyurk RF questionnaire, retaining its separate branches and audience-specific questions.
- Question-related validation, draft restoration, JSON answer persistence, admin display and CSV export.
- Existing header, button styling, privacy panel, ticket, calendar and email presentation changes at the end of the document were excluded. Main was fast-forwarded to `c00b159` before implementation.

## Final behavior

- Cash, mortgage, developer installment are the three active payment choices in both questionnaires. The former mixed-payment option remains readable in historical records.
- Mortgage requires an explicit Yes or No answer about income tax refund. Switching payment methods clears it; non-mortgage submissions omit it. False is preserved as an answer.
- The general investment goal question allows one to four distinct goals. Spyurk retains its six single-choice goals, including capital preservation and multiple purposes.
- Residence abroad has a searchable country catalog localized in all three languages. Search supports Armenian, English, Russian, ISO codes, and РФ / ՌԴ aliases. Search abbreviations cannot be saved as unfinished country names.
- For own residence, Aragatsotn opens Ashtarak / Other, Ararat opens Artashat / Masis / Other, Kotayk opens Abovyan / Qanaqeravan / Other. Other regions have no city question.
- For investment, Kotayk opens Abovyan / Tsaghkadzor / Yeghvard / Other; Tavush opens Dilijan / Other. Other regions have no city question.
- Residence and general market-research locations are region-only. Their obsolete city questions are removed.
- Italy, Bali, the no-purchase-plans horizon, and omission of newsletter consent already existed in main and remain in place.
- Stored historical questionnaire shapes are parsed separately from strict current submissions, so old mortgage records do not acquire invented refund answers, and old single investment goals remain readable.

## Source discrepancy

The latest Armenian investment section specifies Kotayk (Abovyan, Tsaghkadzor, Yeghvard) and Tavush (Dilijan). The Russian and English investment sections still repeat the own-residence city list. The implementation applies the Armenian investment list consistently to all three locales. The Russian residence list also omits Aragatsotn, although the Armenian/English lists and stated count include ten regions; all ten are retained.

## Partner compatibility

- Local storage, admin display and CSV preserve every selected investment goal and the explicit refund answer.
- Coded Mootq answers use arrays for a multi-select partner schema. For the existing RADIO investment-goal schema, multiple selections are represented by its existing “multiple purposes” option. Existing single-goal records keep their original mapping.
- No partner question code for income tax refund is present in the repository's contract/schema fixture. It is included in the internal flattened export as `income_tax_refund`; no new external question code was invented.
- No database schema, migration, production data, deployment, credentials, commit or push was changed.

## Verification

- Passed: typecheck, ESLint, formatting, production build, and all 438 unit/component tests (71 files), including current and historical payloads.
- Passed: all 10 new browser scenarios, covering /hy, /en, /ru and the three localized RF routes; requests are intercepted and validated with the actual API input schema, without creating registrations or sending email/SMS.
- Mobile viewport checked at 390×844; no horizontal overflow.
- The existing `locale-routes` test “remembers the chosen locale when returning to root” fails: navigating /en → / returns /hy instead of /en. Locale routing and that existing test were not changed in this task.
- Local dependency repair installed missing arm64 native packages from the existing lockfile. Package manifest and lockfile were not changed.
