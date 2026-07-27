# Toon Expo Registration — TODO

Updated: 2026-07-27

## Решения (зафиксировано)

1. **QR:** `TE` + 11 / `MQ` + 11; алфавит `A-Z0-9`; regex `^(TE|MQ)[A-Z0-9]{11}$`. Мы генерируем только `TE…`. `sourceSystem` отдельно.
2. **Fast push:** outbox в PostgreSQL → отправка сразу после ответа (`after()`), cron раз в минуту только как страховка. По одной регистрации, без батча. GET feed остаётся backup. Full sync — руками из админки.
3. **Event-day режим:** не нужен.
4. **Минимальный push body (мы решаем):** `sourceRegistrationId`, `ticketCode`, `sourceSystem`, `createdAt` (+ `Idempotency-Key` header; `eventId` если у них multi-event). Без email/phone. Имя — только если Mootq попросит для сканера.

## С Mootq

[ ] Отдать обновлённый контракт (префиксы + наш push payload) + `WRITE`/`READ` ключи
[ ] Получить от них принимающий endpoint + Bearer secret для fast push
[ ] Совместный smoke: inbound POST, наш push, feed GET, full export
[ ] Получить `MOOTQ_FULL_EXPORT_BASE_URL` + `MOOTQ_FULL_EXPORT_KEY`
[ ] Проверить на их сканере коды `TE…` / `MQ…` (uppercase)

## Реализация (после/параллельно контракту)

[ ] Сменить генерацию/валидацию ticket code на `TE`/`MQ` + `A-Z0-9`
[ ] Outbox + `after()` push client + minute cron retry
[x] Обновить `14-MOOTQ-PARTNER-CONTRACT.md` / ticketing docs
