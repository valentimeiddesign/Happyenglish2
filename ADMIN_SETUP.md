# Happy English — Адмін-панель + синхронізація з Telegram

Адмінка для керування курсами/підписками та покупцями, з автоматичною
видачею доступу до приватних Telegram-каналів після оплати.

## Що зроблено

| Компонент | Опис |
|-----------|------|
| **Supabase Postgres** | Таблиці `products`, `customers`, `purchases`, `access_grants`, `link_tokens`, `events`, `settings`, `admins` + RLS |
| **Edge Function `happy-english`** | Один сервіс з маршрутами `/telegram`, `/liqpay`, `/admin`, `/cron` |
| **Telegram-бот** | `/start`, каталог, створення покупки, кнопка «Я оплатив», авто-видача доступу, зняття доступу |
| **LiqPay webhook** | Перевірка підпису, авто-прив'язка оплати до покупки, видача доступу |
| **Cron (щогодини)** | Знімає доступ при завершенні підписки + нагадування за N днів |
| **Адмінка (React)** | `/admin` — логін, огляд, курси, покупці, продажі, синхронізація, налаштування |

## Доступ

- **Адмінка:** `https://<ваш-домен>/admin` (локально `http://localhost:3000/admin`)
- **Логін:** `valentimeid@gmail.com`
- **Пароль:** передається окремо (не зберігається в репозиторії) → змініть у «Налаштуваннях» після першого входу.

> 🔒 Ніколи не тримайте паролі/секрети у цьому файлі — репозиторій публічний.

## Реквізити проєкту Supabase

- Project ref: `mpyrezevqoynwcpejgzt`
- URL: `https://mpyrezevqoynwcpejgzt.supabase.co`
- Publishable key (у `.env`, безпечний для фронтенду): `sb_publishable_9Vkjjk4gZf0l1obh2XkExw_vNHOl0bQ`

---

## Крок 1. Додати секрети Edge Functions

Supabase Dashboard → проєкт **Happy English** → **Edge Functions → Secrets** (або
`supabase secrets set ...`). Ці ключі **не** зберігаються у браузері.

| Секрет | Значення |
|--------|----------|
| `TELEGRAM_BOT_TOKEN` | Токен вашого бота з @BotFather |
| `TELEGRAM_WEBHOOK_SECRET` | Будь-який випадковий рядок (напр. `he_wh_9f3a...`) — захищає webhook |
| `LIQPAY_PUBLIC_KEY` | Public key з кабінету LiqPay |
| `LIQPAY_PRIVATE_KEY` | Private key з кабінету LiqPay |
| `CRON_SECRET` | значення планувальника — візьміть у Supabase → Settings → Cron (передається окремо) |

`SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` додаються Supabase автоматично.

## Крок 2. Підключити Telegram webhook

1. Зайдіть в адмінку → **Синхронізація**.
2. Натисніть **«Перевірити»** — має показати `@ваш_бот — підключено`.
3. Натисніть **«Встановити»** біля Webhook. Готово.

Альтернатива вручну:
```
https://api.telegram.org/bot<ТОКЕН>/setWebhook?url=https://mpyrezevqoynwcpejgzt.supabase.co/functions/v1/happy-english/telegram&secret_token=<TELEGRAM_WEBHOOK_SECRET>
```

## Крок 3. Прив'язати приватні канали до курсів

1. Додайте **бота як адміністратора** у кожен приватний канал (з правом
   «Запрошувати користувачів / керувати посиланнями» та «Блокувати учасників»).
2. Коли бот стає адміном, він надішле вам у Telegram `chat_id` каналу
   (потрібно один раз написати боту, щоб він знав ваш `admin_chat_id` — див. крок 4).
3. В адмінці → **Курси** → відкрийте курс → вставте **ID каналу** →
   натисніть **«Тест»** (перевірить доступ бота і кількість учасників) → **«Зберегти»**.

## Крок 4. Chat ID адміністратора (для сповіщень)

1. Напишіть боту команду **`/id`** — він відповість вашим `chat_id`.
2. В адмінці → **Налаштування** → вставте його у **Chat ID адміністратора** → «Зберегти».

Тепер бот надсилатиме вам сповіщення про оплати, заявки і виявлені канали.

## Крок 5. LiqPay callback

У кабінеті LiqPay вкажіть **Server URL**:
```
https://mpyrezevqoynwcpejgzt.supabase.co/functions/v1/happy-english/liqpay
```
Оплати з `order_id` (створені ботом) прив'язуються автоматично. Оплати без
`order_id` (статичний QR) потрапляють у «Продажі» як **не прив'язані** — прив'яжіть
їх до покупця вручну (кнопка «Прив'язати» → потім «Видати доступ»).

---

## Як працює прив'язка покупця (рекомендований потік)

```
Кнопка на сайті → https://t.me/<бот>?start=buy_<slug курсу>
   → бот показує курс + кнопку «Сплатити» (LiqPay з нашим order_id)
   → покупець оплачує → LiqPay callback → знайдено покупку за order_id
   → бот створює персональне посилання й додає покупця в приватний канал
   → підписка закінчується → cron знімає доступ (kick з каналу)
```

Щоб увімкнути автоматичну прив'язку, змініть кнопки «Підписатися» на сайті
(`src/components/Catalog.tsx`, `src/components/Pricing.tsx`) з прямих LiqPay-посилань
на deep-link бота: `https://t.me/<bot_username>?start=buy_<slug>`
(slug курсів: `go-getter-1`, `go-getter-2`, `go-getter-3`, `4minds-a2`,
`sub-monthly`, `sub-3months`).

Ручний резерв: у розділі **Продажі** будь-яку покупку можна підтвердити й видати
доступ кнопкою «Видати доступ», а активну — «Зняти».

---

## Запуск і деплой

```bash
npm i
npm run dev      # локально, http://localhost:3000  (адмінка: /admin)
npm run build    # у папку build/
```

**Важливо для деплою (Vercel/Netlify тощо):** увімкніть SPA-fallback, щоб
маршрут `/admin/*` віддавав `index.html`. Наприклад, `vercel.json`:
```json
{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
```

## Cron

Планувальник `happy-english-hourly` вже створений (pg_cron) і викликає
`/happy-english/cron` щогодини. Змінити період можна в SQL або в Supabase → Integrations → Cron.
