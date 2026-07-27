# Toon Expo Registration — TODO

Updated: 2026-07-27

## Сейчас (мы)

[x] Vercel Production: секреты (`AUTH_SECRET`, `DATABASE_URL`, `DIRECT_URL`, `RESEND_*`, `MOOTQ_WRITE_KEY`, `MOOTQ_READ_KEY`) — без `MOOTQ_FULL_EXPORT_*`
[ ] Vercel: переименовать `DELIVERY_CRON_SECRET` → `CRON_SECRET` (то же значение) + Redeploy
[x] Cron в коде: `vercel.json` каждые 5 мин → `/api/internal/delivery/process` (лёгкий, при пустой очереди почти no-op)
[ ] WAF Rate Limit на Mootq POST/GET (высокий потолок)
[ ] Smoke на `reg.toonexpo.com`: регистрация → QR → email → `/ticket/...`

## С Mootq

[ ] Отдать контракт `docs/technical-specification/14-MOOTQ-PARTNER-CONTRACT.md` + `WRITE`/`READ` ключи
[ ] Совместный smoke: inbound POST, feed GET, full export
[ ] Получить от них `MOOTQ_FULL_EXPORT_BASE_URL` + `MOOTQ_FULL_EXPORT_KEY`
[ ] Проверить 13-символьные коды на их сканере
