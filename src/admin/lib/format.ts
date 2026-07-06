import { PurchaseStatus } from "./types";

export function money(amount: number | null | undefined, currency = "UAH") {
  if (amount == null) return "—";
  const suffix = currency === "UAH" ? "₴" : " " + currency;
  return `${Number(amount).toLocaleString("uk-UA")}${suffix}`;
}

export function dateShort(iso: string | null | undefined) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("uk-UA", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function dateTime(iso: string | null | undefined) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("uk-UA", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function customerName(c?: {
  first_name?: string | null;
  last_name?: string | null;
  telegram_username?: string | null;
  telegram_id?: number | null;
} | null) {
  if (!c) return "—";
  const name = [c.first_name, c.last_name].filter(Boolean).join(" ").trim();
  if (name) return name;
  if (c.telegram_username) return "@" + c.telegram_username;
  if (c.telegram_id) return "id " + c.telegram_id;
  return "Без імені";
}

export const STATUS_STYLES: Record<PurchaseStatus, string> = {
  pending: "bg-amber-100 text-amber-700",
  paid: "bg-blue-100 text-blue-700",
  active: "bg-green-100 text-green-700",
  expired: "bg-gray-100 text-gray-600",
  cancelled: "bg-red-100 text-red-700",
  refunded: "bg-purple-100 text-purple-700",
};

export function daysLeft(iso: string | null | undefined): number | null {
  if (!iso) return null;
  const ms = new Date(iso).getTime() - Date.now();
  return Math.ceil(ms / 86400000);
}
