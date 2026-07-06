import { useEffect, useState } from "react";
import { supabase, adminAction } from "../lib/supabase";
import { Product } from "../lib/types";
import { money } from "../lib/format";
import { PageHeader, Card, Spinner, EmptyState } from "../components/bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Send, CheckCircle2, XCircle, Loader2 } from "lucide-react";

const empty: Partial<Product> = {
  slug: "",
  title: "",
  type: "course",
  emoji: "📘",
  price: 0,
  currency: "UAH",
  billing_period: "one_time",
  duration_days: null,
  is_active: true,
  sort_order: 0,
};

export function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<Product> | null>(null);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from("products").select("*").order("sort_order");
    setProducts((data as any) ?? []);
    setLoading(false);
  }
  useEffect(() => {
    load();
  }, []);

  if (loading)
    return (
      <div className="flex justify-center py-24">
        <Spinner className="w-6 h-6 text-muted-foreground" />
      </div>
    );

  return (
    <div>
      <PageHeader
        title="Курси та підписки"
        subtitle="Товари, ціни та прив'язка до Telegram-каналів"
        actions={
          <Button onClick={() => setEditing({ ...empty })}>
            <Plus className="w-4 h-4 mr-1" /> Додати
          </Button>
        }
      />

      {products.length === 0 ? (
        <EmptyState title="Немає курсів" hint="Додайте перший курс" />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((p) => (
            <Card key={p.id} className="p-5 flex flex-col">
              <div className="flex items-start justify-between mb-2">
                <div className="text-2xl">{p.emoji ?? "📚"}</div>
                <div className="flex items-center gap-2">
                  {p.is_active ? (
                    <span className="text-[11px] font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                      активний
                    </span>
                  ) : (
                    <span className="text-[11px] font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                      прихований
                    </span>
                  )}
                </div>
              </div>
              <h3 className="font-bold">{p.title}</h3>
              <p className="text-xs text-muted-foreground mb-3">
                {p.type === "subscription" ? "Підписка" : "Курс"}
                {p.level ? ` · ${p.level}` : ""}
                {p.age ? ` · ${p.age}` : ""}
              </p>
              <div className="text-lg font-bold mb-3">
                {money(p.price, p.currency)}
                <span className="text-xs font-normal text-muted-foreground ml-1">
                  {p.duration_days ? `/ ${p.duration_days} дн.` : "· безстроково"}
                </span>
              </div>

              <div className="mt-auto pt-3 border-t border-border flex items-center justify-between">
                <span
                  className={`text-xs flex items-center gap-1 ${
                    p.telegram_channel_id ? "text-green-600" : "text-amber-600"
                  }`}
                >
                  <Send className="w-3.5 h-3.5" />
                  {p.telegram_channel_id ? "канал прив'язаний" : "канал не вказаний"}
                </span>
                <Button variant="ghost" size="sm" onClick={() => setEditing(p)}>
                  <Pencil className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {editing && (
        <ProductDialog
          product={editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            load();
          }}
        />
      )}
    </div>
  );
}

function ProductDialog({
  product,
  onClose,
  onSaved,
}: {
  product: Partial<Product>;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<Partial<Product>>(product);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<null | { ok: boolean; text: string }>(null);
  const isNew = !product.id;

  function set<K extends keyof Product>(key: K, value: Product[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function save() {
    if (!form.title || !form.slug) {
      toast.error("Вкажіть назву та slug");
      return;
    }
    setSaving(true);
    const payload: any = {
      slug: form.slug,
      title: form.title,
      subtitle: form.subtitle || null,
      type: form.type,
      description: form.description || null,
      emoji: form.emoji || null,
      level: form.level || null,
      age: form.age || null,
      lessons: form.lessons ? Number(form.lessons) : null,
      price: Number(form.price || 0),
      currency: form.currency || "UAH",
      billing_period: form.billing_period || "one_time",
      duration_days: form.duration_days ? Number(form.duration_days) : null,
      payment_link: form.payment_link || null,
      telegram_channel_id: form.telegram_channel_id || null,
      telegram_channel_title: form.telegram_channel_title || null,
      telegram_invite_link: form.telegram_invite_link || null,
      sort_order: Number(form.sort_order || 0),
      is_active: form.is_active ?? true,
    };
    const q = isNew
      ? supabase.from("products").insert(payload)
      : supabase.from("products").update(payload).eq("id", product.id!);
    const { error } = await q;
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Збережено");
    onSaved();
  }

  async function testChannel() {
    if (!form.telegram_channel_id) return;
    setTesting(true);
    setTestResult(null);
    try {
      const r: any = await adminAction("test_channel", { channel_id: form.telegram_channel_id });
      if (r?.chat?.ok) {
        setTestResult({
          ok: true,
          text: `${r.chat.result.title ?? "канал"} · учасників: ${r.count?.result ?? "?"}`,
        });
        if (r.chat.result.title && !form.telegram_channel_title) {
          set("telegram_channel_title", r.chat.result.title);
        }
      } else {
        setTestResult({ ok: false, text: r?.chat?.description ?? "Бот не має доступу до каналу" });
      }
    } catch (e: any) {
      setTestResult({ ok: false, text: e.message });
    }
    setTesting(false);
  }

  async function remove() {
    if (!confirm("Видалити курс? Пов'язані продажі залишаться, але без прив'язки.")) return;
    setSaving(true);
    const { error } = await supabase.from("products").delete().eq("id", product.id!);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Видалено");
    onSaved();
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isNew ? "Новий курс" : form.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-1">
              <Label>Емодзі</Label>
              <Input value={form.emoji ?? ""} onChange={(e) => set("emoji", e.target.value)} />
            </div>
            <div className="col-span-2">
              <Label>Назва *</Label>
              <Input value={form.title ?? ""} onChange={(e) => set("title", e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Slug *</Label>
              <Input value={form.slug ?? ""} onChange={(e) => set("slug", e.target.value)} placeholder="go-getter-1" />
            </div>
            <div>
              <Label>Тип</Label>
              <select
                className="w-full h-9 rounded-md border border-input bg-input-background px-3 text-sm"
                value={form.type}
                onChange={(e) => set("type", e.target.value as any)}
              >
                <option value="course">Курс</option>
                <option value="subscription">Підписка</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label>Ціна</Label>
              <Input type="number" value={form.price ?? 0} onChange={(e) => set("price", Number(e.target.value) as any)} />
            </div>
            <div>
              <Label>Валюта</Label>
              <Input value={form.currency ?? "UAH"} onChange={(e) => set("currency", e.target.value)} />
            </div>
            <div>
              <Label>Доступ, днів</Label>
              <Input
                type="number"
                placeholder="∞"
                value={form.duration_days ?? ""}
                onChange={(e) => set("duration_days", (e.target.value ? Number(e.target.value) : null) as any)}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label>Рівень</Label>
              <Input value={form.level ?? ""} onChange={(e) => set("level", e.target.value)} placeholder="A1" />
            </div>
            <div>
              <Label>Вік</Label>
              <Input value={form.age ?? ""} onChange={(e) => set("age", e.target.value)} placeholder="7-10 років" />
            </div>
            <div>
              <Label>Уроків</Label>
              <Input
                type="number"
                value={form.lessons ?? ""}
                onChange={(e) => set("lessons", (e.target.value ? Number(e.target.value) : null) as any)}
              />
            </div>
          </div>

          <div>
            <Label>Опис</Label>
            <Textarea
              value={form.description ?? ""}
              onChange={(e) => set("description", e.target.value)}
              rows={2}
            />
          </div>

          <div>
            <Label>Посилання на оплату (LiqPay / privat24)</Label>
            <Input
              value={form.payment_link ?? ""}
              onChange={(e) => set("payment_link", e.target.value)}
              placeholder="https://www.privat24.ua/..."
            />
          </div>

          <div className="rounded-xl bg-muted/50 p-3 space-y-3">
            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
              <Send className="w-3.5 h-3.5" /> Telegram-канал
            </div>
            <div>
              <Label>ID каналу</Label>
              <div className="flex gap-2">
                <Input
                  value={form.telegram_channel_id ?? ""}
                  onChange={(e) => set("telegram_channel_id", e.target.value)}
                  placeholder="-1001234567890"
                />
                <Button variant="outline" onClick={testChannel} disabled={testing || !form.telegram_channel_id}>
                  {testing ? <Loader2 className="w-4 h-4 animate-spin" /> : "Тест"}
                </Button>
              </div>
              {testResult && (
                <div
                  className={`flex items-center gap-1.5 text-xs mt-1.5 ${
                    testResult.ok ? "text-green-600" : "text-destructive"
                  }`}
                >
                  {testResult.ok ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                  {testResult.text}
                </div>
              )}
            </div>
            <div>
              <Label>Назва каналу (необов'язково)</Label>
              <Input
                value={form.telegram_channel_title ?? ""}
                onChange={(e) => set("telegram_channel_title", e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Switch checked={form.is_active ?? true} onCheckedChange={(v) => set("is_active", v)} />
              <Label className="cursor-pointer">Активний (показувати на сайті/боті)</Label>
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-xs text-muted-foreground">Порядок</Label>
              <Input
                type="number"
                className="w-16"
                value={form.sort_order ?? 0}
                onChange={(e) => set("sort_order", Number(e.target.value) as any)}
              />
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:justify-between">
          {!isNew ? (
            <Button variant="ghost" className="text-destructive hover:text-destructive" onClick={remove}>
              <Trash2 className="w-4 h-4 mr-1" /> Видалити
            </Button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Скасувати
            </Button>
            <Button onClick={save} disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}
              Зберегти
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
