// Happy English — all-in-one backend edge function.
// One deployment, routed by URL sub-path. Each route enforces its own auth:
//   POST /happy-english/telegram   Telegram bot webhook  (X-Telegram secret header)
//   POST /happy-english/liqpay     LiqPay payment callback (HMAC signature)
//   POST /happy-english/admin      Admin panel actions     (Supabase JWT + is_admin)
//   POST /happy-english/cron       Scheduled expiry/reminders (X-Cron-Secret)
// deno-lint-ignore-file no-explicit-any
import { createClient, SupabaseClient } from "npm:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN") ?? "";
const WEBHOOK_SECRET = Deno.env.get("TELEGRAM_WEBHOOK_SECRET") ?? "";
const CRON_SECRET = Deno.env.get("CRON_SECRET") ?? "";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });
}

function serviceClient(): SupabaseClient {
  return createClient(SUPABASE_URL, SERVICE_ROLE, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

async function tg(method: string, params: Record<string, unknown> = {}): Promise<any> {
  if (!BOT_TOKEN) return { ok: false, description: "TELEGRAM_BOT_TOKEN is not set" };
  const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  return await res.json();
}

async function getSetting(sb: SupabaseClient, key: string): Promise<any> {
  const { data } = await sb.from("settings").select("value").eq("key", key).maybeSingle();
  return data?.value ?? null;
}

async function logEvent(sb: SupabaseClient, type: string, f: any = {}) {
  await sb.from("events").insert({
    type,
    customer_id: f.customer_id ?? null,
    purchase_id: f.purchase_id ?? null,
    product_id: f.product_id ?? null,
    payload: f.payload ?? {},
  });
}

async function notifyAdmin(sb: SupabaseClient, text: string) {
  const chatId = await getSetting(sb, "admin_chat_id");
  if (chatId) await tg("sendMessage", { chat_id: chatId, text, parse_mode: "HTML" });
}

function randomToken(len = 6): string {
  const bytes = new Uint8Array(len);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

// ---------- access grant / revoke ----------

async function grantAccessForPurchase(
  sb: SupabaseClient,
  purchaseId: string,
  opts: { notifyUser?: boolean } = {},
): Promise<{ inviteLink: string | null; error?: string }> {
  const notifyUser = opts.notifyUser ?? true;
  const { data: purchase } = await sb
    .from("purchases")
    .select("*, customer:customers(*), product:products(*)")
    .eq("id", purchaseId)
    .single();
  if (!purchase) return { inviteLink: null, error: "purchase_not_found" };
  const product: any = purchase.product;
  const customer: any = purchase.customer;
  if (!product) return { inviteLink: null, error: "product_not_found" };

  const now = new Date();
  const expires =
    product.duration_days != null ? new Date(now.getTime() + product.duration_days * 86400000) : null;

  let inviteLink: string | null = product.telegram_invite_link ?? null;
  let grantError: string | null = null;
  if (product.telegram_channel_id) {
    const res = await tg("createChatInviteLink", {
      chat_id: product.telegram_channel_id,
      member_limit: 1,
      name: `HE ${(purchase.payment_order_id ?? purchase.id).toString().slice(0, 24)}`,
    });
    if (res.ok) inviteLink = res.result.invite_link;
    else grantError = res.description ?? "createChatInviteLink_failed";
  }

  await sb
    .from("purchases")
    .update({
      status: "active",
      started_at: now.toISOString(),
      expires_at: expires ? expires.toISOString() : null,
    })
    .eq("id", purchaseId);

  await sb.from("access_grants").insert({
    purchase_id: purchaseId,
    customer_id: customer?.id ?? null,
    product_id: product.id,
    telegram_channel_id: product.telegram_channel_id ?? null,
    status: grantError ? "failed" : "granted",
    invite_link: inviteLink,
    granted_at: grantError ? null : now.toISOString(),
    error: grantError,
  });

  if (notifyUser && customer?.telegram_id && inviteLink) {
    const msg = (await getSetting(sb, "access_granted_message")) ?? "Дякуємо за оплату! ✅ Ось посилання для доступу:";
    await tg("sendMessage", {
      chat_id: customer.telegram_id,
      text: `${msg}\n\n<b>${product.title}</b>\n${inviteLink}`,
      parse_mode: "HTML",
    });
  }

  await logEvent(sb, grantError ? "access_grant_failed" : "access_granted", {
    purchase_id: purchaseId,
    customer_id: customer?.id ?? null,
    product_id: product.id,
    payload: { inviteLink, grantError },
  });
  return { inviteLink, error: grantError ?? undefined };
}

async function revokeAccessForPurchase(sb: SupabaseClient, purchaseId: string) {
  const { data: purchase } = await sb
    .from("purchases")
    .select("*, customer:customers(*), product:products(*)")
    .eq("id", purchaseId)
    .single();
  if (!purchase) return;
  const product: any = purchase.product;
  const customer: any = purchase.customer;

  if (product?.telegram_channel_id && customer?.telegram_id) {
    await tg("banChatMember", { chat_id: product.telegram_channel_id, user_id: customer.telegram_id });
    await tg("unbanChatMember", {
      chat_id: product.telegram_channel_id,
      user_id: customer.telegram_id,
      only_if_banned: true,
    });
  }
  await sb.from("purchases").update({ status: "expired" }).eq("id", purchaseId);
  await sb
    .from("access_grants")
    .update({ status: "revoked", revoked_at: new Date().toISOString() })
    .eq("purchase_id", purchaseId)
    .eq("status", "granted");
  if (customer?.telegram_id) {
    await tg("sendMessage", {
      chat_id: customer.telegram_id,
      text: "Термін дії підписки завершився, доступ призупинено. Щоб продовжити — оформіть підписку знову 🙏",
    }).catch(() => {});
  }
  await logEvent(sb, "access_revoked", {
    purchase_id: purchaseId,
    customer_id: customer?.id ?? null,
    product_id: product?.id ?? null,
  });
}

// ---------- LiqPay ----------

async function liqpaySignature(privateKey: string, data: string): Promise<string> {
  const buf = new TextEncoder().encode(privateKey + data + privateKey);
  const digest = await crypto.subtle.digest("SHA-1", buf);
  return btoa(String.fromCharCode(...new Uint8Array(digest)));
}

async function liqpayCheckoutUrl(p: {
  amount: number;
  currency: string;
  description: string;
  orderId: string;
  serverUrl: string;
}): Promise<string | null> {
  const pub = Deno.env.get("LIQPAY_PUBLIC_KEY");
  const priv = Deno.env.get("LIQPAY_PRIVATE_KEY");
  if (!pub || !priv) return null;
  const payload = {
    public_key: pub,
    version: 3,
    action: "pay",
    amount: p.amount,
    currency: p.currency,
    description: p.description,
    order_id: p.orderId,
    server_url: p.serverUrl,
  };
  const data = btoa(JSON.stringify(payload));
  const signature = await liqpaySignature(priv, data);
  return `https://www.liqpay.ua/api/3/checkout?${new URLSearchParams({ data, signature })}`;
}

// ================= ROUTER =================

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return json({ ok: true });
  const path = new URL(req.url).pathname;
  const route = path.split("/").filter(Boolean).pop(); // last segment

  try {
    if (route === "telegram") return await handleTelegram(req);
    if (route === "liqpay") return await handleLiqpay(req);
    if (route === "admin") return await handleAdmin(req);
    if (route === "cron") return await handleCron(req);
    return json({ ok: true, service: "happy-english", routes: ["telegram", "liqpay", "admin", "cron"] });
  } catch (e) {
    console.error("route error", route, e);
    return json({ error: String(e) }, 500);
  }
});

// ---------- Telegram webhook ----------

async function handleTelegram(req: Request) {
  if (WEBHOOK_SECRET && req.headers.get("x-telegram-bot-api-secret-token") !== WEBHOOK_SECRET) {
    return json({ ok: false }, 401);
  }
  let update: any;
  try {
    update = await req.json();
  } catch {
    return json({ ok: true });
  }
  const sb = serviceClient();
  try {
    if (update.message) await onMessage(sb, update.message);
    else if (update.callback_query) await onCallback(sb, update.callback_query);
    else if (update.my_chat_member) await onMyChatMember(sb, update.my_chat_member);
  } catch (e) {
    console.error("bot error", e);
    await logEvent(sb, "bot_error", { payload: { error: String(e) } });
  }
  return json({ ok: true });
}

async function upsertCustomer(sb: SupabaseClient, from: any) {
  const { data } = await sb
    .from("customers")
    .upsert(
      {
        telegram_id: from.id,
        telegram_username: from.username ?? null,
        first_name: from.first_name ?? null,
        last_name: from.last_name ?? null,
        source: "bot",
      },
      { onConflict: "telegram_id" },
    )
    .select()
    .single();
  return data;
}

async function onMessage(sb: SupabaseClient, msg: any) {
  const from = msg.from;
  if (!from || from.is_bot) return;
  const text: string = msg.text ?? "";

  if (text.trim() === "/id") {
    await tg("sendMessage", {
      chat_id: msg.chat.id,
      text: `Ваш chat_id: <code>${msg.chat.id}</code>`,
      parse_mode: "HTML",
    });
    return;
  }

  const customer = await upsertCustomer(sb, from);

  if (text.startsWith("/start")) {
    const payload = text.split(" ")[1]?.trim() ?? "";
    if (payload.startsWith("buy_")) return void (await startPurchase(sb, customer, from, payload.slice(4)));
    if (payload.startsWith("link_")) return void (await linkByToken(sb, customer, from, payload.slice(5)));
    return void (await sendWelcome(sb, from));
  }
  await sendWelcome(sb, from);
}

async function sendWelcome(sb: SupabaseClient, from: any) {
  const welcome = (await getSetting(sb, "welcome_message")) ?? "Привіт! 👋 Обери курс:";
  const { data: products } = await sb
    .from("products")
    .select("slug,title,price,currency,emoji")
    .eq("is_active", true)
    .order("sort_order");
  const keyboard = (products ?? []).map((p: any) => [
    { text: `${p.emoji ?? "📚"} ${p.title} — ${p.price}${p.currency === "UAH" ? "₴" : " " + p.currency}`, callback_data: `buy:${p.slug}` },
  ]);
  await tg("sendMessage", { chat_id: from.id, text: welcome, reply_markup: { inline_keyboard: keyboard } });
}

async function startPurchase(sb: SupabaseClient, customer: any, from: any, slug: string) {
  const { data: product } = await sb.from("products").select("*").eq("slug", slug).eq("is_active", true).maybeSingle();
  if (!product) {
    await tg("sendMessage", { chat_id: from.id, text: "Курс не знайдено 🤔" });
    return;
  }
  const orderId = `HE-${randomToken(6)}`;
  const { data: purchase } = await sb
    .from("purchases")
    .insert({
      customer_id: customer.id,
      product_id: product.id,
      status: "pending",
      amount: product.price,
      currency: product.currency,
      payment_provider: "liqpay",
      payment_order_id: orderId,
      meta: { via: "bot" },
    })
    .select()
    .single();

  const dynamicUrl = await liqpayCheckoutUrl({
    amount: Number(product.price),
    currency: product.currency,
    description: `${product.title} — Happy English`,
    orderId,
    serverUrl: `${SUPABASE_URL}/functions/v1/happy-english/liqpay`,
  });
  const payUrl = dynamicUrl ?? product.payment_link;

  const buttons: any[] = [];
  if (payUrl) buttons.push([{ text: `💳 Сплатити ${product.price}${product.currency === "UAH" ? "₴" : " " + product.currency}`, url: payUrl }]);
  buttons.push([{ text: "✅ Я оплатив(ла)", callback_data: `paid:${purchase.id}` }]);

  await tg("sendMessage", {
    chat_id: from.id,
    text:
      `<b>${product.title}</b>\n${product.description ?? ""}\n\nВартість: <b>${product.price}${product.currency === "UAH" ? "₴" : " " + product.currency}</b>\n\nНатисни «Сплатити», а після оплати — «Я оплатив(ла)».`,
    parse_mode: "HTML",
    reply_markup: { inline_keyboard: buttons },
  });
  await logEvent(sb, "purchase_started", { customer_id: customer.id, product_id: product.id, purchase_id: purchase.id, payload: { orderId } });
}

async function onCallback(sb: SupabaseClient, cq: any) {
  const from = cq.from;
  const data: string = cq.data ?? "";
  const customer = await upsertCustomer(sb, from);

  if (data.startsWith("buy:")) {
    await tg("answerCallbackQuery", { callback_query_id: cq.id });
    await startPurchase(sb, customer, from, data.slice(4));
    return;
  }
  if (data.startsWith("paid:")) {
    const purchaseId = data.slice(5);
    await sb.from("purchases").update({ status: "paid", meta: { awaiting_confirmation: true } }).eq("id", purchaseId).eq("status", "pending");
    const { data: purchase } = await sb.from("purchases").select("*, product:products(title)").eq("id", purchaseId).maybeSingle();
    await tg("answerCallbackQuery", { callback_query_id: cq.id, text: "Дякуємо! Перевіряємо оплату." });
    await tg("sendMessage", { chat_id: from.id, text: "Дякуємо! 🙌 Ми перевіримо оплату і надішлемо доступ найближчим часом." });
    await notifyAdmin(
      sb,
      `💰 <b>Заявка про оплату</b>\nКурс: ${purchase?.product?.title ?? "?"}\nКлієнт: ${from.first_name ?? ""} @${from.username ?? "—"} (id ${from.id})\nПеревірте оплату та видайте доступ в адмінці.`,
    );
    await logEvent(sb, "payment_claimed", { customer_id: customer.id, purchase_id: purchaseId });
    return;
  }
  await tg("answerCallbackQuery", { callback_query_id: cq.id });
}

async function linkByToken(sb: SupabaseClient, customer: any, from: any, token: string) {
  const { data: lt } = await sb.from("link_tokens").select("*").eq("token", token).eq("used", false).maybeSingle();
  if (!lt) {
    await tg("sendMessage", { chat_id: from.id, text: "Посилання недійсне або вже використане." });
    return;
  }
  if (lt.expires_at && new Date(lt.expires_at) < new Date()) {
    await tg("sendMessage", { chat_id: from.id, text: "Термін дії посилання минув." });
    return;
  }
  if (lt.purchase_id) {
    await sb.from("purchases").update({ customer_id: customer.id }).eq("id", lt.purchase_id);
    await grantAccessForPurchase(sb, lt.purchase_id, { notifyUser: true });
  }
  await sb.from("link_tokens").update({ used: true, customer_id: customer.id }).eq("id", lt.id);
  await logEvent(sb, "account_linked", { customer_id: customer.id, purchase_id: lt.purchase_id });
}

async function onMyChatMember(sb: SupabaseClient, upd: any) {
  const chat = upd.chat;
  const status = upd.new_chat_member?.status;
  if (!chat || !["channel", "supergroup", "group"].includes(chat.type)) return;
  if (!["administrator", "member", "creator"].includes(status)) return;
  await logEvent(sb, "channel_detected", { payload: { chat_id: chat.id, title: chat.title, type: chat.type, status } });
  await notifyAdmin(
    sb,
    `📡 Бот доданий у «${chat.title ?? chat.id}»\nchat_id: <code>${chat.id}</code>\nВставте цей id у налаштування відповідного курсу.`,
  );
}

// ---------- LiqPay callback ----------

async function handleLiqpay(req: Request) {
  const priv = Deno.env.get("LIQPAY_PRIVATE_KEY");
  if (!priv) return json({ error: "LIQPAY_PRIVATE_KEY not set" }, 500);

  let data = "";
  let signature = "";
  const ct = req.headers.get("content-type") ?? "";
  if (ct.includes("application/json")) {
    const b = await req.json();
    data = b.data;
    signature = b.signature;
  } else {
    const form = await req.formData();
    data = String(form.get("data") ?? "");
    signature = String(form.get("signature") ?? "");
  }
  if (!data || !signature) return json({ error: "missing data/signature" }, 400);
  if ((await liqpaySignature(priv, data)) !== signature) return json({ error: "bad signature" }, 400);

  let payload: any;
  try {
    payload = JSON.parse(atob(data));
  } catch {
    return json({ error: "bad payload" }, 400);
  }

  const sb = serviceClient();
  const orderId = payload.order_id ?? null;
  const status = payload.status ?? "";
  const isPaid = ["success", "sandbox", "subscribed", "wait_accept"].includes(status);
  await logEvent(sb, "liqpay_callback", { payload: { orderId, status, amount: payload.amount } });

  const { data: purchase } = orderId
    ? await sb.from("purchases").select("*").eq("payment_order_id", orderId).maybeSingle()
    : { data: null };

  if (purchase) {
    await sb
      .from("purchases")
      .update({
        payment_id: payload.transaction_id ? String(payload.transaction_id) : purchase.payment_id,
        status: isPaid ? "paid" : purchase.status,
        meta: { ...(purchase.meta ?? {}), liqpay_status: status },
      })
      .eq("id", purchase.id);
    if (isPaid) {
      const res = await grantAccessForPurchase(sb, purchase.id, { notifyUser: true });
      await notifyAdmin(sb, `✅ Оплата отримана (order ${orderId}). Доступ ${res.error ? "НЕ видано: " + res.error : "видано автоматично"}.`);
    }
    return json({ ok: true });
  }

  if (isPaid) {
    await sb.from("purchases").insert({
      status: "paid",
      amount: payload.amount ?? null,
      currency: payload.currency ?? "UAH",
      payment_provider: "liqpay",
      payment_order_id: orderId,
      payment_id: payload.transaction_id ? String(payload.transaction_id) : null,
      meta: { unmatched: true, liqpay_status: status, description: payload.description ?? null },
    });
    await notifyAdmin(
      sb,
      `⚠️ Оплата без прив'язки (order ${orderId ?? "—"}, ${payload.amount ?? "?"}${payload.currency ?? ""}).\nОпис: ${payload.description ?? "—"}\nПрив'яжіть її до клієнта в адмінці.`,
    );
  }
  return json({ ok: true });
}

// ---------- Admin actions (JWT protected) ----------

async function handleAdmin(req: Request) {
  const authHeader = req.headers.get("Authorization") ?? "";
  if (!authHeader.startsWith("Bearer ")) return json({ error: "unauthorized" }, 401);

  const userClient = createClient(SUPABASE_URL, ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false },
  });
  const { data: userData } = await userClient.auth.getUser();
  const user = userData?.user;
  if (!user) return json({ error: "unauthorized" }, 401);

  const sb = serviceClient();
  const { data: admin } = await sb.from("admins").select("user_id").eq("user_id", user.id).maybeSingle();
  if (!admin) return json({ error: "forbidden" }, 403);

  const body = await req.json().catch(() => ({}));
  const action = body.action as string;

  switch (action) {
    case "grant":
      return json(await grantAccessForPurchase(sb, body.purchase_id, { notifyUser: true }));
    case "confirm_and_grant": {
      await sb.from("purchases").update({ status: "paid" }).eq("id", body.purchase_id);
      return json(await grantAccessForPurchase(sb, body.purchase_id, { notifyUser: true }));
    }
    case "resend_invite":
      return json(await grantAccessForPurchase(sb, body.purchase_id, { notifyUser: true }));
    case "revoke":
      await revokeAccessForPurchase(sb, body.purchase_id);
      return json({ ok: true });
    case "send_message": {
      const r = await tg("sendMessage", { chat_id: body.telegram_id, text: body.text, parse_mode: "HTML" });
      return json(r);
    }
    case "create_link_token": {
      const token = randomToken(10);
      await sb.from("link_tokens").insert({
        token,
        purchase_id: body.purchase_id ?? null,
        product_id: body.product_id ?? null,
        expires_at: new Date(Date.now() + 7 * 86400000).toISOString(),
      });
      const username = (await getSetting(sb, "bot_username")) ?? "";
      return json({ token, deep_link: username ? `https://t.me/${username}?start=link_${token}` : null });
    }
    case "set_webhook": {
      const url = `${SUPABASE_URL}/functions/v1/happy-english/telegram`;
      const r = await tg("setWebhook", {
        url,
        secret_token: WEBHOOK_SECRET || undefined,
        allowed_updates: ["message", "callback_query", "my_chat_member"],
        drop_pending_updates: true,
      });
      return json({ url, result: r });
    }
    case "webhook_info":
      return json(await tg("getWebhookInfo"));
    case "bot_info": {
      const r = await tg("getMe");
      if (r.ok && r.result?.username) {
        await sb.from("settings").upsert({ key: "bot_username", value: r.result.username });
      }
      return json(r);
    }
    case "test_channel": {
      const chat = await tg("getChat", { chat_id: body.channel_id });
      const count = await tg("getChatMemberCount", { chat_id: body.channel_id });
      return json({ chat, count });
    }
    default:
      return json({ error: "unknown_action" }, 400);
  }
}

// ---------- Cron: expire subscriptions + reminders ----------

async function handleCron(req: Request) {
  if (CRON_SECRET && req.headers.get("x-cron-secret") !== CRON_SECRET) return json({ error: "forbidden" }, 403);
  const sb = serviceClient();
  const nowIso = new Date().toISOString();

  // 1) Revoke expired active subscriptions.
  const { data: expired } = await sb
    .from("purchases")
    .select("id")
    .eq("status", "active")
    .not("expires_at", "is", null)
    .lt("expires_at", nowIso);
  for (const p of expired ?? []) await revokeAccessForPurchase(sb, p.id);

  // 2) Remind buyers whose access ends soon (once).
  const days = Number((await getSetting(sb, "reminder_days_before")) ?? 3);
  const soon = new Date(Date.now() + days * 86400000).toISOString();
  const { data: ending } = await sb
    .from("purchases")
    .select("*, customer:customers(telegram_id), product:products(title)")
    .eq("status", "active")
    .not("expires_at", "is", null)
    .gt("expires_at", nowIso)
    .lt("expires_at", soon);
  let reminded = 0;
  for (const p of ending ?? []) {
    if ((p.meta ?? {}).reminded) continue;
    if (p.customer?.telegram_id) {
      await tg("sendMessage", {
        chat_id: p.customer.telegram_id,
        text: `⏰ Нагадування: підписка «${p.product?.title ?? ""}» завершується ${new Date(p.expires_at).toLocaleDateString("uk-UA")}. Продовжіть, щоб не втратити доступ 🙌`,
      }).catch(() => {});
      await sb.from("purchases").update({ meta: { ...(p.meta ?? {}), reminded: true } }).eq("id", p.id);
      reminded++;
    }
  }

  await logEvent(sb, "cron_run", { payload: { expired: expired?.length ?? 0, reminded } });
  return json({ ok: true, expired: expired?.length ?? 0, reminded });
}
