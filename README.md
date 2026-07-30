# Toon Expo Registration

Публичная регистрация + QR-билет + admin. Стек: Next.js на Vercel, PostgreSQL на Neon.

Документы: [`docs/TECH_CARD.md`](docs/TECH_CARD.md) · [`docs/01-ARCHITECTURE.md`](docs/01-ARCHITECTURE.md) · [`TODO.md`](TODO.md)

---

## Cron / Neon (важно)

Retry-cron’ы **opt-in**, чтобы Neon не держался awake без нужды.

| Env | Сейчас | Когда включить |
|-----|--------|----------------|
| `DELIVERY_CRON_ENABLED` | `false` | Перед событием / когда нужен retry email·SMS |
| `MOOTQ_PUSH_CRON_ENABLED` | `false` | Когда Mootq даст `MOOTQ_PUSH_URL` + `MOOTQ_PUSH_KEY` |

- `true` / `1` = **ON** (обрабатывает jobs)
- unset / `false` = **OFF** (ответ `DISABLED`, Neon не трогает)

Расписание Vercel: только delivery в [`vercel.json`](vercel.json) (`0 * * * *`). Mootq-push cron **убран** из расписания, пока нет их URL.

Регистрация / email / SMS / push сразу после ответа (`after()`) от флагов **не зависят**. Флаги режут только периодический retry.

### Перед событием (чеклист)

1. Vercel Production env: `DELIVERY_CRON_ENABLED=true`
2. Когда Mootq даст push endpoint: добавить `MOOTQ_PUSH_URL` / `MOOTQ_PUSH_KEY`, вернуть cron в `vercel.json`, `MOOTQ_PUSH_CRON_ENABLED=true`
3. Redeploy после смены env / `vercel.json`
4. После события: снова `false` (или unset), чтобы Neon мог уснуть

Подробнее: [`.env.example`](.env.example) · [`docs/technical-specification/11-VERCEL-PRODUCTION-CHECKLIST.md`](docs/technical-specification/11-VERCEL-PRODUCTION-CHECKLIST.md)
