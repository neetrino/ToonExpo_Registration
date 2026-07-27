# Настройка Vercel WAF

Ручная инструкция владельцу проекта. Все правила сначала проверяются в **Log** mode.

## Принцип

WAF — аварийный предохранитель, а не обычный лимит посетителей. На площадке много устройств могут использовать один публичный IP. Ожидаемый тестовый пик — 1 000 регистраций за 10 минут.

Процесс-локальный лимит `5 / 10 минут / IP` должен быть удалён. Redis для rate limit не добавляется.

## Публичная регистрация

| Поле               | Значение                               |
| ------------------ | -------------------------------------- |
| Имя                | `registration-emergency-ceiling`       |
| Match              | `POST /api/registrations`              |
| Режим              | `Log`, затем `Enforce` после репетиции |
| Начальная гипотеза | `5,000 requests / 10 minutes / IP`     |
| Action             | `429`                                  |

Это не окончательная цифра. Подтвердить нагрузочным тестом:

- [ ] 1 000 регистраций/10 минут с одного source IP проходят.
- [ ] Validation/retry traffic учтён.
- [ ] Явный бесконечный flood получает `429`.
- [ ] False positives отслеживаются.

## Mootq minimal inbound

| Поле            | Значение                                                      |
| --------------- | ------------------------------------------------------------- |
| Имя             | `mootq-inbound-safety-ceiling`                                |
| Match           | согласованный `POST /api/v1/integrations/mootq/registrations` |
| Основная защита | scoped write credential + validation + idempotency            |
| WAF             | высокий malfunction ceiling, Log → Enforce                    |

Порог должен быть намного выше ожидаемого потока и retry burst. Это защита от ошибочного цикла/утечки ключа, а не бизнес-ограничение.

## Mootq fast/full reads

| Поле            | Значение                                         |
| --------------- | ------------------------------------------------ |
| Имя             | `mootq-read-safety-ceiling`                      |
| Match           | согласованные fast/full GET/POST routes          |
| Основная защита | scoped read/export credential + bounded pages    |
| WAF             | выше live polling и немедленных catch-up страниц |

Live polling раз в три секунды — примерно 20 запросов в минуту, но порог нельзя ставить ровно 20: reconnect/catch-up создают легитимные пики. Toon Expo не контролирует частоту через admin/env.

## Admin login

| Поле               | Значение                                 |
| ------------------ | ---------------------------------------- |
| Имя                | `admin-login-rate-limit`                 |
| Match              | фактический Auth.js Credentials callback |
| Начальная гипотеза | `15 requests / 60 seconds / IP`          |
| Режим              | Log → Enforce                            |

Сначала подтвердить реальный путь в Firewall Observations.

## Дополнительные правила

- Ticket page/PNG используют длинные bearer URL; лимит должен быть мягким.
- Full-sync страницы ограничиваются authentication и максимальным `limit`.
- Стабильные Mootq egress IP можно allowlist как дополнительную защиту.
- Provider callbacks, если добавлены, проверяются подписью/replay, а не только IP.

## Чего не делать

- Не возвращать in-memory лимит 5/10m.
- Не добавлять polling-mode switch.
- Не использовать cache как security counter.
- Не ставить partner threshold равным ожидаемой частоте.
- Не логировать authorization, ticket code/token, PII или provider payload.

## После публикации

- Смотреть Firewall Observations на репетиции и мероприятии.
- При false positive уточнять matcher/threshold.
- При атаке ограничивать конкретный источник/route.
- Фиксировать каждое изменение правила, причину и ответственного.

Связанный checklist: [`../technical-specification/11-VERCEL-PRODUCTION-CHECKLIST.md`](../technical-specification/11-VERCEL-PRODUCTION-CHECKLIST.md).
