# Toon Expo Registration — TODO

Updated: 2026-07-27

## Наша сторона (сделать нам)

[ ] В Vercel Production выставить `SITE_URL=https://reg.toonexpo.com` (уже привязан к проекту)
[ ] В Vercel Production/Preview добавить те же секреты, что в локальном `.env`: `AUTH_SECRET`, `DATABASE_URL`, `DIRECT_URL` (только migrate, не в runtime если разделяете роли), `RESEND_*`, `DELIVERY_CRON_SECRET`, `MOOTQ_WRITE_KEY`, `MOOTQ_READ_KEY` (ADMIN_* только для локального seed)
[ ] После смены env на Vercel — Redeploy Production
[ ] Проверить, что `RESEND_FROM_EMAIL=hi@mail.toonexpo.com` и домен `mail.toonexpo.com` verified в Resend
[x] Настроить Vercel WAF Rate Limit на `POST /api/registrations` (5000 / 600s / IP → 429)
[ ] Добавить WAF malfunction ceiling на Mootq POST/GET (высокий порог)
[ ] Настроить Vercel Cron на `POST /api/internal/delivery/process` с Bearer `DELIVERY_CRON_SECRET` (раз в 1–5 мин)
[ ] Прогнать ручной smoke на prod: одна регистрация Toon Expo → success QR → email → `/ticket/...`
[ ] Проверить Neon: paid plan / backup / PITR по возможности
[ ] Разделить Neon runtime vs migration роли (least privilege), если ещё owner
[ ] После стабилизации backfill — миграция: `sourceSystem`/`ticketCode`/`ticketViewToken` сделать NOT NULL + финальные constraints
[ ] Load rehearsal: ~1000 регистраций / 10 минут + контроль Resend/WAF
[ ] Production checklist: `docs/technical-specification/11-VERCEL-PRODUCTION-CHECKLIST.md`
[ ] Alerts: ошибки регистраций, backlog DeliveryJob, Resend quota
[ ] SMS/Peleka — только когда будет контракт (сейчас не блокер)

## С Mootq (сделать вместе / ждать их)

[ ] Отправить `docs/technical-specification/14-MOOTQ-PARTNER-CONTRACT.md` на согласование
[ ] Безопасно передать Mootq `MOOTQ_WRITE_KEY` и отдельно `MOOTQ_READ_KEY` (не в чат/тикет публично)
[ ] Согласовать финальные имена полей/URL если отличаются от draft
[ ] Их smoke: POST inbound → у нас запись + email; GET feed → их БД
[ ] Их smoke: full export (`POST/GET .../full-sync-runs`) с их стороны
[ ] Получить от них `MOOTQ_FULL_EXPORT_BASE_URL` + `MOOTQ_FULL_EXPORT_KEY` для нашей кнопки Import
[ ] Проверить 13-символьные коды с обеих сторон на их реальном сканере
[ ] После события — полный sync (import + export) и сверка counts

## Не забыть / не делать

[ ] Не коммитить `.env` и не светить ключи в чатах
[ ] Не включать SMS, пока нет Peleka contract
[ ] Не ослаблять WAF «чтобы тесты проходили» без записи причины
