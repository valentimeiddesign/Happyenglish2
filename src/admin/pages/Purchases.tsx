import { useEffect, useState } from "react";
import { supabase, adminAction } from "../lib/supabase";
import { Purchase, Customer, PurchaseStatus } from "../lib/types";
import { money, dateShort, dateTime, customerName, daysLeft } from "../lib/format";
import { PageHeader, Card, Spinner, EmptyState, StatusBadge } from "../components/bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Check, Ban, RefreshCw, Link2, Loader2, Search } from "lucide-react";

type Filter = "all" | "awaiting" | "active" | "expired";
const FILTERS: { key: Filter; label: string; statuses?: PurchaseStatus[] }[] = [
  { key: "awaiting", label: "Очікують", statuses: ["pending", "paid"] },
  { key: "active", label: "Активні", statuses: ["active"] },
  { key: "expired", label: "Завершені", statuses: ["expired", "cancelled", "refunded"] },
  { key: "all", label: "Усі" },
];

export function Purchases() {
  const [rows, setRows] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("awaiting");
  const [busy, setBusy] = useState<string | null>(null);
  const [linking, setLinking] = useState<Purchase | null>(null);

  async function load() {
    setLoading(true);
    let q = supabase
      .from("purchases")
      .select("*, customer:customers(*), product:products(title,emoji,currency)")
      .order("created_at", { ascending: false })
      .limit(200);
    const f = FILTERS.find((x) => x.key === filter);
    if (f?.statuses) q = q.in("status", f.statuses);
    const { data } = await q;
    setRows((data as any) ?? []);
    setLoading(false);
  }
  useEffect(() => {
    load();
  }, [filter]);

  async function act(id: string, action: string, okMsg: string) {
    setBusy(id);
    try {
      const r: any = await adminAction(action, { purchase_id: id });
      if (r?.error) toast.error(`Помилка: ${r.error}`);
      else toast.success(okMsg);
      await load();
    } catch (e: any) {
      toast.error(e.message);
    }
    setBusy(null);
  }

  return (
    <div>
      <PageHeader title="Продажі та підписки" subtitle="Оплати, прив'язка покупців і доступ до каналів" />

      <div className="flex gap-1 mb-4 bg-muted rounded-xl p-1 w-fit">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === f.key ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-24">
          <Spinner className="w-6 h-6 text-muted-foreground" />
        </div>
      ) : rows.length === 0 ? (
        <Card>
          <EmptyState title="Порожньо" hint="Тут з'являться покупки" />
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-muted-foreground border-b border-border">
                  <th className="px-4 py-3 font-medium">Покупець</th>
                  <th className="px-4 py-3 font-medium">Курс</th>
                  <th className="px-4 py-3 font-medium">Сума</th>
                  <th className="px-4 py-3 font-medium">Статус</th>
                  <th className="px-4 py-3 font-medium">Доступ до</th>
                  <th className="px-4 py-3 font-medium text-right">Дії</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((p) => {
                  const dl = daysLeft(p.expires_at);
                  const linked = !!p.customer_id;
                  return (
                    <tr key={p.id} className="hover:bg-muted/30">
                      <td className="px-4 py-3">
                        {linked ? (
                          <div>
                            <div className="font-medium">{customerName(p.customer)}</div>
                            <div className="text-xs text-muted-foreground">
                              {p.customer?.telegram_username ? "@" + p.customer.telegram_username : "—"}
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-amber-600 font-medium">не прив'язано</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="mr-1">{(p.product as any)?.emoji}</span>
                        {(p.product as any)?.title ?? <span className="text-muted-foreground">—</span>}
                        <div className="text-xs text-muted-foreground">{dateShort(p.created_at)}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">{money(p.amount, p.currency)}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={p.status} />
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-xs">
                        {p.expires_at ? (
                          <span className={dl != null && dl <= 3 ? "text-amber-600 font-medium" : ""}>
                            {dateShort(p.expires_at)}
                            {p.status === "active" && dl != null && dl > 0 ? ` (${dl} дн.)` : ""}
                          </span>
                        ) : p.status === "active" ? (
                          "безстроково"
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 justify-end">
                          {!linked && (
                            <Button variant="outline" size="sm" onClick={() => setLinking(p)}>
                              <Link2 className="w-3.5 h-3.5 mr-1" /> Прив'язати
                            </Button>
                          )}
                          {(p.status === "pending" || p.status === "paid") && linked && (
                            <Button
                              size="sm"
                              disabled={busy === p.id}
                              onClick={() => act(p.id, "confirm_and_grant", "Доступ видано")}
                            >
                              {busy === p.id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <>
                                  <Check className="w-3.5 h-3.5 mr-1" /> Видати доступ
                                </>
                              )}
                            </Button>
                          )}
                          {p.status === "active" && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={busy === p.id}
                                onClick={() => act(p.id, "resend_invite", "Посилання надіслано")}
                                title="Повторно надіслати запрошення"
                              >
                                <RefreshCw className="w-3.5 h-3.5" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-destructive hover:text-destructive"
                                disabled={busy === p.id}
                                onClick={() => {
                                  if (confirm("Зняти доступ до каналу?")) act(p.id, "revoke", "Доступ знято");
                                }}
                              >
                                <Ban className="w-3.5 h-3.5" />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {linking && (
        <LinkCustomerDialog
          purchase={linking}
          onClose={() => setLinking(null)}
          onLinked={() => {
            setLinking(null);
            load();
          }}
        />
      )}
    </div>
  );
}

function LinkCustomerDialog({
  purchase,
  onClose,
  onLinked,
}: {
  purchase: Purchase;
  onClose: () => void;
  onLinked: () => void;
}) {
  const [query, setQuery] = useState("");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  async function search() {
    setLoading(true);
    let q = supabase.from("customers").select("*").order("created_at", { ascending: false }).limit(30);
    if (query.trim()) {
      q = supabase
        .from("customers")
        .select("*")
        .or(
          `first_name.ilike.%${query}%,telegram_username.ilike.%${query}%,phone.ilike.%${query}%,email.ilike.%${query}%`,
        )
        .limit(30);
    }
    const { data } = await q;
    setCustomers((data as any) ?? []);
    setLoading(false);
  }
  useEffect(() => {
    search();
  }, [query]);

  async function link(customerId: string) {
    setSaving(true);
    const { error } = await supabase
      .from("purchases")
      .update({ customer_id: customerId })
      .eq("id", purchase.id);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Покупця прив'язано. Тепер видайте доступ.");
    onLinked();
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Прив'язати покупця</DialogTitle>
        </DialogHeader>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Ім'я, @username, телефон, email"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="max-h-72 overflow-y-auto -mx-1 mt-1">
          {loading ? (
            <div className="flex justify-center py-8">
              <Spinner className="w-5 h-5 text-muted-foreground" />
            </div>
          ) : customers.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">Нікого не знайдено</p>
          ) : (
            customers.map((c) => (
              <button
                key={c.id}
                disabled={saving}
                onClick={() => link(c.id)}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-muted text-left"
              >
                <div>
                  <div className="text-sm font-medium">{customerName(c)}</div>
                  <div className="text-xs text-muted-foreground">
                    {c.telegram_username ? "@" + c.telegram_username : c.phone || c.email || "—"}
                  </div>
                </div>
                <Link2 className="w-4 h-4 text-muted-foreground" />
              </button>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
