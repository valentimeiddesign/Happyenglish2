import { useEffect, useState } from "react";
import { supabase, adminAction } from "../lib/supabase";
import { Customer, Purchase } from "../lib/types";
import { dateShort, customerName, money } from "../lib/format";
import { PageHeader, Card, Spinner, EmptyState, StatusBadge } from "../components/bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Search, Send, Loader2, MessageSquare } from "lucide-react";

export function Customers() {
  const [rows, setRows] = useState<(Customer & { purchases: { count: number }[] })[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Customer | null>(null);

  async function load() {
    setLoading(true);
    let q = supabase
      .from("customers")
      .select("*, purchases(count)")
      .order("created_at", { ascending: false })
      .limit(100);
    if (query.trim()) {
      q = supabase
        .from("customers")
        .select("*, purchases(count)")
        .or(
          `first_name.ilike.%${query}%,last_name.ilike.%${query}%,telegram_username.ilike.%${query}%,phone.ilike.%${query}%,email.ilike.%${query}%`,
        )
        .limit(100);
    }
    const { data } = await q;
    setRows((data as any) ?? []);
    setLoading(false);
  }
  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [query]);

  return (
    <div>
      <PageHeader title="Покупці" subtitle="Клієнти, прив'язані до Telegram" />

      <div className="relative mb-4 max-w-sm">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Пошук за ім'ям, @username, телефоном"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-24">
          <Spinner className="w-6 h-6 text-muted-foreground" />
        </div>
      ) : rows.length === 0 ? (
        <Card>
          <EmptyState title="Немає покупців" hint="Вони з'являться після старту бота" />
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-muted-foreground border-b border-border">
                  <th className="px-4 py-3 font-medium">Ім'я</th>
                  <th className="px-4 py-3 font-medium">Telegram</th>
                  <th className="px-4 py-3 font-medium">Контакти</th>
                  <th className="px-4 py-3 font-medium">Джерело</th>
                  <th className="px-4 py-3 font-medium">Покупок</th>
                  <th className="px-4 py-3 font-medium">Додано</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((c) => (
                  <tr
                    key={c.id}
                    className="hover:bg-muted/30 cursor-pointer"
                    onClick={() => setSelected(c)}
                  >
                    <td className="px-4 py-3 font-medium">
                      {customerName(c)}
                      {c.is_blocked && (
                        <span className="ml-2 text-[11px] text-red-600 bg-red-50 px-1.5 py-0.5 rounded">
                          заблок.
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {c.telegram_id ? (
                        <span className="text-green-600 text-xs">
                          {c.telegram_username ? "@" + c.telegram_username : "id " + c.telegram_id}
                        </span>
                      ) : (
                        <span className="text-amber-600 text-xs">не прив'язано</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {c.phone || c.email || "—"}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{c.source ?? "—"}</td>
                    <td className="px-4 py-3">{(c as any).purchases?.[0]?.count ?? 0}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{dateShort(c.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {selected && (
        <CustomerDialog
          customer={selected}
          onClose={() => setSelected(null)}
          onSaved={() => {
            setSelected(null);
            load();
          }}
        />
      )}
    </div>
  );
}

function CustomerDialog({
  customer,
  onClose,
  onSaved,
}: {
  customer: Customer;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<Customer>(customer);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    supabase
      .from("purchases")
      .select("*, product:products(title,emoji)")
      .eq("customer_id", customer.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => setPurchases((data as any) ?? []));
  }, [customer.id]);

  async function save() {
    setSaving(true);
    const { error } = await supabase
      .from("customers")
      .update({
        first_name: form.first_name,
        last_name: form.last_name,
        phone: form.phone,
        email: form.email,
        notes: form.notes,
        is_blocked: form.is_blocked,
      })
      .eq("id", customer.id);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Збережено");
    onSaved();
  }

  async function sendMessage() {
    if (!message.trim() || !form.telegram_id) return;
    setSending(true);
    try {
      const r: any = await adminAction("send_message", { telegram_id: form.telegram_id, text: message });
      if (r?.ok) {
        toast.success("Повідомлення надіслано");
        setMessage("");
      } else toast.error(r?.description ?? "Не вдалося надіслати");
    } catch (e: any) {
      toast.error(e.message);
    }
    setSending(false);
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{customerName(form)}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-1">
          <div className="text-xs text-muted-foreground">
            Telegram:{" "}
            {form.telegram_id ? (
              <span className="text-green-600">
                {form.telegram_username ? "@" + form.telegram_username : ""} (id {form.telegram_id})
              </span>
            ) : (
              <span className="text-amber-600">не прив'язано</span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Ім'я</Label>
              <Input value={form.first_name ?? ""} onChange={(e) => setForm({ ...form, first_name: e.target.value })} />
            </div>
            <div>
              <Label>Прізвище</Label>
              <Input value={form.last_name ?? ""} onChange={(e) => setForm({ ...form, last_name: e.target.value })} />
            </div>
            <div>
              <Label>Телефон</Label>
              <Input value={form.phone ?? ""} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div>
              <Label>Email</Label>
              <Input value={form.email ?? ""} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
          </div>
          <div>
            <Label>Нотатки</Label>
            <Textarea rows={2} value={form.notes ?? ""} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={form.is_blocked} onCheckedChange={(v) => setForm({ ...form, is_blocked: v })} />
            <Label className="cursor-pointer">Заблокований</Label>
          </div>

          {/* Purchases */}
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
              Покупки
            </div>
            {purchases.length === 0 ? (
              <p className="text-sm text-muted-foreground">Немає покупок</p>
            ) : (
              <div className="space-y-1.5">
                {purchases.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between text-sm bg-muted/50 rounded-lg px-3 py-2"
                  >
                    <span>
                      {(p.product as any)?.emoji} {(p.product as any)?.title ?? "—"}
                    </span>
                    <span className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{money(p.amount, p.currency)}</span>
                      <StatusBadge status={p.status} />
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Send message */}
          {form.telegram_id && (
            <div className="rounded-xl bg-muted/50 p-3">
              <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5" /> Повідомлення в Telegram
              </div>
              <Textarea
                rows={2}
                placeholder="Текст повідомлення..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <Button size="sm" className="mt-2" onClick={sendMessage} disabled={sending || !message.trim()}>
                {sending ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Send className="w-4 h-4 mr-1" />}
                Надіслати
              </Button>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={onClose}>
            Закрити
          </Button>
          <Button onClick={save} disabled={saving}>
            {saving && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}
            Зберегти
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
