import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { Purchase, EventRow } from "../lib/types";
import { money, dateTime, customerName, daysLeft } from "../lib/format";
import { PageHeader, StatCard, StatusBadge, Card, Spinner, EmptyState } from "../components/bits";
import { Users, CreditCard, BadgeDollarSign, Clock, ArrowRight } from "lucide-react";

const EVENT_LABELS: Record<string, string> = {
  purchase_started: "Почато покупку",
  payment_claimed: "Заявка про оплату",
  liqpay_callback: "Callback LiqPay",
  access_granted: "Видано доступ",
  access_grant_failed: "Помилка видачі доступу",
  access_revoked: "Знято доступ",
  account_linked: "Прив'язано акаунт",
  channel_detected: "Виявлено канал",
  cron_run: "Перевірка підписок",
  bot_error: "Помилка бота",
};

export function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ customers: 0, active: 0, awaiting: 0, revenue: 0 });
  const [recent, setRecent] = useState<Purchase[]>([]);
  const [events, setEvents] = useState<EventRow[]>([]);

  useEffect(() => {
    (async () => {
      const [{ count: customers }, active, awaiting, revenueRows, recentRows, eventRows] =
        await Promise.all([
          supabase.from("customers").select("id", { count: "exact", head: true }),
          supabase.from("purchases").select("id", { count: "exact", head: true }).eq("status", "active"),
          supabase
            .from("purchases")
            .select("id", { count: "exact", head: true })
            .in("status", ["pending", "paid"]),
          supabase.from("purchases").select("amount").in("status", ["active", "paid", "expired"]),
          supabase
            .from("purchases")
            .select("*, customer:customers(*), product:products(title,emoji)")
            .order("created_at", { ascending: false })
            .limit(8),
          supabase.from("events").select("*").order("created_at", { ascending: false }).limit(12),
        ]);

      const revenue = (revenueRows.data ?? []).reduce((s, r: any) => s + Number(r.amount || 0), 0);
      setStats({
        customers: customers ?? 0,
        active: active.count ?? 0,
        awaiting: awaiting.count ?? 0,
        revenue,
      });
      setRecent((recentRows.data as any) ?? []);
      setEvents((eventRows.data as any) ?? []);
      setLoading(false);
    })();
  }, []);

  if (loading)
    return (
      <div className="flex justify-center py-24">
        <Spinner className="w-6 h-6 text-muted-foreground" />
      </div>
    );

  return (
    <div>
      <PageHeader title="Огляд" subtitle="Ключові показники магазину та Telegram" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatCard label="Покупці" value={stats.customers} icon={<Users className="w-4 h-4" />} />
        <StatCard label="Активні підписки" value={stats.active} icon={<CreditCard className="w-4 h-4" />} />
        <StatCard label="Очікують видачі" value={stats.awaiting} icon={<Clock className="w-4 h-4" />} hint="pending + оплачено" />
        <StatCard label="Дохід" value={money(stats.revenue)} icon={<BadgeDollarSign className="w-4 h-4" />} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent purchases */}
        <Card className="lg:col-span-2 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 className="font-semibold">Останні продажі</h2>
            <Link to="/admin/purchases" className="text-sm text-primary flex items-center gap-1 hover:underline">
              Усі <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          {recent.length === 0 ? (
            <EmptyState title="Ще немає продажів" hint="Вони з'являться після покупок через бота" />
          ) : (
            <div className="divide-y divide-border">
              {recent.map((p) => {
                const dl = daysLeft(p.expires_at);
                return (
                  <div key={p.id} className="flex items-center gap-3 px-5 py-3">
                    <div className="text-xl">{(p.product as any)?.emoji ?? "📚"}</div>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-sm truncate">
                        {(p.product as any)?.title ?? "Без курсу"}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {customerName(p.customer)} · {dateTime(p.created_at)}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-sm font-medium">{money(p.amount, p.currency)}</div>
                      <div className="mt-0.5">
                        <StatusBadge status={p.status} />
                      </div>
                    </div>
                    {p.status === "active" && dl != null && (
                      <div className="text-xs text-muted-foreground w-16 text-right shrink-0">
                        {dl > 0 ? `${dl} дн.` : "сьогодні"}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Activity log */}
        <Card className="overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="font-semibold">Активність / синхронізація</h2>
          </div>
          {events.length === 0 ? (
            <EmptyState title="Немає подій" />
          ) : (
            <div className="divide-y divide-border max-h-[420px] overflow-y-auto">
              {events.map((e) => (
                <div key={e.id} className="px-5 py-2.5">
                  <div className="text-sm font-medium">{EVENT_LABELS[e.type] ?? e.type}</div>
                  <div className="text-xs text-muted-foreground">{dateTime(e.created_at)}</div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
