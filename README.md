# Toon Expo Registration

Публичная регистрация + QR-билет + admin. Стек: Next.js на Vercel, PostgreSQL на Neon.

Документы: [`docs/TECH_CARD.md`](docs/TECH_CARD.md) · [`docs/01-ARCHITECTURE.md`](docs/01-ARCHITECTURE.md) · [`TODO.md`](TODO.md)

---

## Cron / Neon (важно)

Retry-cron’ы **opt-in**, чтобы Neon не держался awake без нужды.

| Env | Сейчас | Когда включить |
|-----|--------|----------------|
| `DELIVERY_CRON_ENABLED` | `false` | Перед событием / когда нужен retry email·SMS |
| `MOOTQ_PUSH_CRON_ENABLED` | `true` (local) | После получения `MOOTQ_PUSH_*`; mirror to Vercel Production |
| `EPHEMERAL_TEST_PHONE_PURGE_ENABLED` | `false` | Пока нужен авто-удаление `+37495426165` через 30 минут |

- `true` / `1` = **ON** (обрабатывает jobs)
- unset / `false` = **OFF** (ответ `DISABLED`, Neon не трогает)

Расписание Vercel: delivery + sheets (`0 * * * *`), mootq-push и тестовый номер `+37495426165` (`* * * * *`) в [`vercel.json`](vercel.json). Тестовый номер удаляется из Neon и Google Sheets через 30 минут (general и Spyurk). После правки Apps Script нужен новый deployment.

Регистрация / email / SMS / push сразу после ответа (`after()`) от флагов **не зависят**. Флаги режут только периодический retry.

### Перед событием (чеклист)

1. Vercel Production env: `DELIVERY_CRON_ENABLED=true` (когда нужен email/SMS retry)
2. Vercel Production: `MOOTQ_PUSH_URL` / `MOOTQ_PUSH_KEY` / `MOOTQ_PUSH_CRON_ENABLED=true` (+ `MOOTQ_WRITE_KEY` для inbound)
3. Redeploy после смены env / `vercel.json`
4. После события: cron-флаги снова `false` (или unset), чтобы Neon мог уснуть


Подробнее: [`.env.example`](.env.example) · [`docs/technical-specification/11-VERCEL-PRODUCTION-CHECKLIST.md`](docs/technical-specification/11-VERCEL-PRODUCTION-CHECKLIST.md)
