# Toon Expo Registration — TODO

Updated: 2026-08-31

## Перед событием (ops)

- [ ] Vercel: `DELIVERY_CRON_ENABLED=true` (+ redeploy)
- [ ] Когда есть `MOOTQ_PUSH_URL`/`MOOTQ_PUSH_KEY`: вернуть mootq-push в `vercel.json`, `MOOTQ_PUSH_CRON_ENABLED=true`
- [ ] После события: оба cron-флага снова `false` (см. [`README.md`](README.md))

## Решения (зафиксировано 2026-08-18)

1. **QR:** `TE` + 11 / `MQ` + 11; алфавит `A-Z0-9`; regex `^(TE|MQ)[A-Z0-9]{11}$`. Мы генерируем только `TE…`.
2. **TE → Mootq:** полный POST сразу после нашей регистрации (ФИО, email, phone, `locale`, плоские `answers`, optional UTM). `sourceRegistrationId` только в `Idempotency-Key`. Макс. 5 req/s. Outbox + retry.
3. **Mootq → TE:** ночной POST. Мы только сохраняем. Email/SMS на MQ не шлём.
4. **Feed / full-sync / attendance inbound:** не в v1 для партнёра. Код recovery оставляем.
5. Контракт: [`docs/technical-specification/16-MOOTQ-INTEGRATION-CONTRACT.md`](docs/technical-specification/16-MOOTQ-INTEGRATION-CONTRACT.md). Письмо: [`15-MOOTQ-HANDOFF.md`](docs/technical-specification/15-MOOTQ-HANDOFF.md). Документ `14` отозван.

## С Mootq

[x] Внутренние решения закрыты; контракт `16` и cover `15` готовы
[x] Отправить `15` + `16` Mootq
[x] Получить sign-off
[ ] Выдать write-ключ (один на событие) + non-prod URL
[ ] Получить `MOOTQ_PUSH_URL` + `MOOTQ_PUSH_KEY`
[x] После sign-off: адаптировать код push/inbound под `16`
[ ] Smoke: наш полный push, их nightly POST, сканер `TE…` / `MQ…`

## Реализация

[x] Ticket code `TE`/`MQ` + `A-Z0-9`
[x] Outbox + `after()` push + cron flags
[x] Push body: полное тело, без `sourceRegistrationId`/`sourceSystem` в JSON, `registeredAt`, flatten `answers`, UTM optional, ≤5 req/s
[x] Inbound: `registeredAt` + required `locale` + optional `answers`; не создавать EMAIL/SMS
