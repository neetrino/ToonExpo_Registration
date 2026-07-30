# Toon Expo Registration — TODO

Updated: 2026-07-30

## Перед событием (ops)

- [ ] Vercel: `DELIVERY_CRON_ENABLED=true` (+ redeploy)
- [ ] Когда есть `MOOTQ_PUSH_URL`/`MOOTQ_PUSH_KEY`: вернуть mootq-push в `vercel.json`, `MOOTQ_PUSH_CRON_ENABLED=true`
- [ ] После события: оба cron-флага снова `false` (см. [`README.md`](README.md))

## Решения (зафиксировано)

1. **QR:** `TE` + 11 / `MQ` + 11; алфавит `A-Z0-9`; regex `^(TE|MQ)[A-Z0-9]{11}$`. Мы генерируем только `TE…`. `sourceSystem` отдельно.
2. **Fast push:** outbox → `after()` сразу; cron-retry только с `MOOTQ_PUSH_*` + `MOOTQ_PUSH_CRON_ENABLED=true`. Delivery cron раз в час + `DELIVERY_CRON_ENABLED`.
3. **Event-day режим приложения:** не нужен (только env-флаги cron).
4. **Минимальный push body:** `sourceRegistrationId`, `ticketCode`, `sourceSystem`, `createdAt` (+ `Idempotency-Key`). Без email/phone.

## С Mootq

[x] Handoff: [`14-MOOTQ-PARTNER-CONTRACT.md`](docs/technical-specification/14-MOOTQ-PARTNER-CONTRACT.md) + [`15-MOOTQ-HANDOFF.md`](docs/technical-specification/15-MOOTQ-HANDOFF.md)
[ ] Отправить handoff Mootq + выдать `MOOTQ_WRITE_KEY` / `MOOTQ_READ_KEY`
[ ] Получить `MOOTQ_PUSH_URL` + `MOOTQ_PUSH_KEY`
[ ] Smoke: inbound POST, наш push, feed GET, full export
[ ] Получить `MOOTQ_FULL_EXPORT_BASE_URL` + `MOOTQ_FULL_EXPORT_KEY`
[ ] Сканер: коды `TE…` / `MQ…` (uppercase)

## Реализация

[x] Ticket code `TE`/`MQ` + `A-Z0-9`
[x] Outbox + `after()` push + cron flags (`DELIVERY_CRON_ENABLED` / `MOOTQ_PUSH_CRON_ENABLED`)
[x] Docs / README ops-памятка
