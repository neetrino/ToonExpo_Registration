# Настройка Vercel WAF (ручная инструкция)

Короткий чеклист для владельца проекта. Код приложения менять не нужно.

## Зачем

В приложении есть **in-memory** лимитеры (best-effort, **per-instance**):

- **Регистрация** — `POST /api/registrations` (`src/lib/security/registration-rate-limit.ts`)
- **Admin login** — credentials через Auth.js (`src/lib/auth/login-throttle.ts`)

На Vercel несколько инстансов не делят память; после деплоя/рестарта счётчики сбрасываются. **Durable** защита от злоупотреблений — **Vercel WAF / Firewall** на уровне edge.

---

## Куда идти

1. [Vercel Dashboard](https://vercel.com) → ваш **Project**
2. Раздел **Firewall** (в некоторых планах/UI: **Security** → **Firewall** → **Configure**)
3. **New Rule** / **Add Rule**

> Если пункты меню отличаются — ищите **Firewall**, **WAF** или **Rate Limiting** в настройках проекта.

---

## Правило 1 — регистрация

| Поле | Значение |
|------|----------|
| **Имя** | `registration-rate-limit` |
| **Match** | Path: `/api/registrations` |
| **Method** | `POST` (если план/дашборд позволяет фильтр по методу) |
| **Режим** | Сначала **Log**, после проверки — **Enforce** |
| **Лимит** | **20 запросов / 60 секунд / IP** (fixed window) |
| **Action** | **429** Rate Limit |

### Чеклист

- [ ] Создать правило в режиме **Log**
- [ ] Отправить одну нормальную регистрацию — **200**, запись в БД есть
- [ ] Контролируемо превысить порог с одного IP — **429**, **новых записей в БД нет**
- [ ] Переключить в **Enforce** и опубликовать
- [ ] Зафиксировать дату публикации и порог

---

## Правило 2 — admin login (рекомендуется)

Логин идёт через Server Action (`loginAdminAction` → `signIn('credentials')`). Auth.js v5 обрабатывается маршрутом `src/app/api/auth/[...nextauth]/route.ts`.

**Основной endpoint credentials:** `POST /api/auth/callback/credentials`

Дополнительно (консервативно): любые `POST` под префиксом `/api/auth/` и форма на `/admin/login`.

| Поле | Значение |
|------|----------|
| **Имя** | `admin-login-rate-limit` |
| **Match (предпочтительно)** | `POST` + path `/api/auth/callback/credentials` |
| **Match (запасной)** | `POST` + path starts with `/api/auth/` **или** path `/admin/login` |
| **Режим** | Сначала **Log**, потом **Enforce** |
| **Лимит** | **10–20 запросов / 60 секунд / IP** (начните с 15) |
| **Action** | **429** |

### Чеклист

- [ ] Создать правило в **Log**
- [ ] Успешный вход в `/admin/login` — **не блокируется**
- [ ] Серия неверных паролей — throttle в приложении + при избытке WAF отдаёт **429**
- [ ] В DevTools → Network при логине виден `POST` на `/api/auth/callback/credentials` (или родственный `/api/auth/*`) — matcher покрывает этот путь
- [ ] Переключить в **Enforce**

> Один легитимный логин = 1–2 запроса к `/api/auth/*`. Порог 10–20/мин с запасом покрывает повторные попытки и CSRF-обмен; при false positive — поднять порог (см. ниже).

---

## Чего НЕ делать

- [ ] **Не отключать** WAF «на время теста» без согласованного окна и мониторинга
- [ ] **Не полагаться** на Vercel Runtime Cache как счётчик безопасности
- [ ] **Не добавлять Redis** для MVP — WAF достаточен для durable rate limit
- [ ] **Не снижать** порог регистрации ниже 20/60s без доказательств злоупотребления

---

## После публикации

- [ ] Открыть **Firewall → Observations** (или аналог) и смотреть срабатывания первые дни кампании
- [ ] При **false positives** (офис, школа, мобильный оператор с shared NAT):
  - поднять порог (например 20 → 30 для регистрации)
  - записать причину и новое значение в ops-заметки
- [ ] При реальной атаке — не отключать WAF; при необходимости временно ужесточить matcher, не трогая прод-код

---

## Связанные документы

Полный чеклист продакшена: [`docs/technical-specification/11-VERCEL-PRODUCTION-CHECKLIST.md`](../technical-specification/11-VERCEL-PRODUCTION-CHECKLIST.md) (раздел «Vercel WAF rate limit»).
