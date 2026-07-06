// Public configuration. The anon/publishable key is safe to ship in the client.
export const SUPABASE_URL =
  (import.meta as any).env?.VITE_SUPABASE_URL ||
  "https://mpyrezevqoynwcpejgzt.supabase.co";

export const SUPABASE_ANON_KEY =
  (import.meta as any).env?.VITE_SUPABASE_ANON_KEY ||
  "sb_publishable_9Vkjjk4gZf0l1obh2XkExw_vNHOl0bQ";

export const ADMIN_FN_URL = `${SUPABASE_URL}/functions/v1/happy-english/admin`;
export const TELEGRAM_WEBHOOK_URL = `${SUPABASE_URL}/functions/v1/happy-english/telegram`;
export const LIQPAY_WEBHOOK_URL = `${SUPABASE_URL}/functions/v1/happy-english/liqpay`;
